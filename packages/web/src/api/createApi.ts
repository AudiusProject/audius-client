import { useEffect } from 'react'

import {
  cacheActions,
  cacheSelectors,
  getErrorMessage,
  Kind,
  Status,
  CommonState
} from '@audius/common'
import { CaseReducerActions, createSlice } from '@reduxjs/toolkit'
import { isEqual, mapValues, zipObject } from 'lodash'
import { denormalize, normalize } from 'normalizr'
import { useDispatch, useSelector } from 'react-redux'

import { apiResponseSchema } from './schema'
import {
  Api,
  ApiState,
  CreateApiConfig,
  EndpointConfig,
  EntityMap,
  FetchErrorAction,
  FetchLoadingAction,
  FetchSucceededAction,
  PerEndpointState,
  PerKeyState,
  SliceConfig,
  StrippedEntityMap
} from './types'
const { addEntries } = cacheActions

export const createApi = ({
  reducerPath,
  endpoints,
  kind
}: CreateApiConfig) => {
  const api = {
    reducerPath,
    hooks: {}
  } as unknown as Api

  const sliceConfig: SliceConfig = {
    name: reducerPath,
    initialState: {},
    reducers: {}
  }

  for (const endpointName of Object.keys(endpoints)) {
    addEndpointToSlice(sliceConfig, endpointName)
  }

  const slice = createSlice<ApiState, any, any>(sliceConfig)

  for (const [endpointName, endpoint] of Object.entries(endpoints)) {
    buildEndpointHooks(
      api,
      endpointName,
      endpoint,
      slice.actions,
      reducerPath,
      kind
    )
  }

  api.reducer = slice.reducer

  return api
}

const getKeyFromFetchArgs = (fetchArgs: any) => {
  return JSON.stringify(fetchArgs)
}

const addEndpointToSlice = (sliceConfig: SliceConfig, endpointName: string) => {
  const initState: PerKeyState = {
    status: Status.IDLE
  }
  sliceConfig.initialState[endpointName] = {}
  sliceConfig.reducers = {
    ...sliceConfig.reducers,
    [`fetch${capitalize(endpointName)}Loading`]: (
      state: ApiState,
      action: FetchLoadingAction
    ) => {
      const { fetchArgs } = action.payload
      const key = getKeyFromFetchArgs(fetchArgs)
      if (!state[endpointName][key]) {
        state[endpointName][key] = initState
      }
      state[endpointName][key].status = Status.LOADING
    },
    [`fetch${capitalize(endpointName)}Error`]: (
      state: ApiState,
      action: FetchErrorAction
    ) => {
      const { fetchArgs, errorMessage } = action.payload
      const key = getKeyFromFetchArgs(fetchArgs)
      if (!state[endpointName][key]) {
        state[endpointName][key] = initState
      }
      state[endpointName][key].status = Status.ERROR
      state[endpointName][key].errorMessage = errorMessage
    },
    [`fetch${capitalize(endpointName)}Succeeded`]: (
      state: ApiState,
      action: FetchSucceededAction
    ) => {
      const { fetchArgs, nonNormalizedData, strippedEntityMap } = action.payload
      const key = getKeyFromFetchArgs(fetchArgs)
      if (!state[endpointName][key]) {
        state[endpointName][key] = initState
      }
      state[endpointName][key].status = Status.SUCCESS
      state[endpointName][key].nonNormalizedData = nonNormalizedData
      state[endpointName][key].strippedEntityMap = strippedEntityMap
    }
  }
}

const buildEndpointHooks = (
  api: Api,
  endpointName: string,
  endpoint: EndpointConfig,
  actions: CaseReducerActions<any>,
  reducerPath: string,
  kind?: Kind
) => {
  const useQuery = (fetchArgs: any) => {
    const dispatch = useDispatch()
    const key = getKeyFromFetchArgs(fetchArgs)
    const queryState = useSelector((state: any) => {
      const endpointState: PerEndpointState = state[reducerPath][endpointName]
      if (!endpointState[key]) return null
      const { nonNormalizedData, ...rest } = endpointState[key]

      // TODO: Be careful of rerendering because of the new object
      // maybe have override for equality function
      return { nonNormalizedData, ...rest }
    })

    const { nonNormalizedData, status, errorMessage, strippedEntityMap } =
      queryState ?? {
        nonNormalizedData: null,
        status: Status.IDLE,
        errorMessage: null
      }

    const cachedData = useSelector((state: CommonState) => {
      const rehydratedEntityMap =
        strippedEntityMap && selectRehydrateEntityMap(state, strippedEntityMap)
      return rehydratedEntityMap
        ? denormalize(nonNormalizedData, apiResponseSchema, rehydratedEntityMap)
        : nonNormalizedData
    }, isEqual)

    useEffect(() => {
      const fetchWrapped = async () => {
        if (cachedData) return
        if (status === Status.LOADING) return
        try {
          dispatch(
            // @ts-ignore
            actions[`fetch${capitalize(endpointName)}Loading`]({
              fetchArgs
            }) as FetchLoadingAction
          )
          const apiData = await endpoint.fetch(fetchArgs)
          if (!apiData) {
            throw new Error('Remote data not found')
          }

          const { entities, result } = normalize(apiData, apiResponseSchema)
          dispatch(addEntries(Object.keys(entities), entities))
          const strippedEntityMap = stripEntityMap(entities)

          dispatch(
            // @ts-ignore
            actions[`fetch${capitalize(endpointName)}Succeeded`]({
              fetchArgs,
              nonNormalizedData: result,
              strippedEntityMap
            }) as FetchSucceededAction
          )
        } catch (e) {
          // TODO: debugging only
          console.error(e)
          dispatch(
            // @ts-ignore
            actions[`fetch${capitalize(endpointName)}Error`]({
              fetchArgs,
              errorMessage: getErrorMessage(e)
            }) as FetchErrorAction
          )
        }
      }
      fetchWrapped()
    }, [fetchArgs, cachedData, dispatch, status])

    return { data: cachedData, status, errorMessage }
  }
  api.hooks[`use${capitalize(endpointName)}`] = useQuery
}

const stripEntityMap = (entities: EntityMap): StrippedEntityMap => {
  return mapValues(
    entities,
    (entityType) => entityType && Object.keys(entityType)
  )
}

const selectRehydrateEntityMap = (
  state: CommonState,
  strippedEntityMap: StrippedEntityMap
): EntityMap | undefined => {
  try {
    return mapValues(
      strippedEntityMap,
      (entityIds, kind) =>
        entityIds &&
        zipObject(
          entityIds,
          entityIds.map((entityId) => {
            const cachedEntity = cacheSelectors.getEntry(state, {
              kind: Kind[kind as keyof typeof Kind],
              id: parseInt(entityId)
            })
            // TODO: reject if not all entities are populated
            if (!cachedEntity) throw new Error('missing entity')
            return cachedEntity
          })
        )
    )
  } catch (e) {
    if ((e as Error).message !== 'missing entity') {
      throw e
    }
  }
}

export function capitalize(str: string) {
  return str.replace(str[0], str[0].toUpperCase())
}
