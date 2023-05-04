import { useEffect } from 'react'

import {
  cacheActions,
  cacheSelectors,
  getErrorMessage,
  Kind,
  Status
} from '@audius/common'
import {
  Action,
  CaseReducerActions,
  createSlice,
  CreateSliceOptions,
  PayloadAction,
  Reducer
} from '@reduxjs/toolkit'
import { normalize } from 'normalizr'
import { useDispatch, useSelector } from 'react-redux'

import { apiResponseSchema } from './schema'
const { addEntries } = cacheActions

type Api = {
  reducer: Reducer<any, Action>
  hooks: {
    [key: string]: (...args: any[]) => any
  }
}

type SliceConfig = CreateSliceOptions<any, any, any>

type EndpointOptions = {}

type EndpointConfig = {
  fetch: (args: any) => Promise<any>
  options?: EndpointOptions
}

type FetchBaseAction = {
  args: any[]
}
type FetchLoadingAction = PayloadAction<FetchBaseAction & {}>
type FetchErrorAction = PayloadAction<
  FetchBaseAction & {
    errorMessage: string
  }
>
type FetchSucceededAction = PayloadAction<
  FetchBaseAction & {
    id: any
    nonNormalizedData: any
  }
>

type PerKeyState = {
  status: Status
  nonNormalizedData?: any
  errorMessage?: string
}

type PerEndpointState = {
  [key: string]: PerKeyState
}

type ApiState = {
  [key: string]: PerEndpointState
}

type CreateApiConfig = {
  reducerPath: string
  endpoints: { [name: string]: EndpointConfig }
  kind?: Kind
}

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

  for (const name of Object.keys(endpoints)) {
    addEndpointToSlice(sliceConfig, name)
  }

  const slice = createSlice<ApiState, any, any>(sliceConfig)

  for (const [name, endpoint] of Object.entries(endpoints)) {
    buildEndpointHooks(api, name, endpoint, slice.actions, reducerPath, kind)
  }

  api.reducer = slice.reducer

  return api
}

const getKeyFromArgs = (args: any) => {
  return JSON.stringify(args)
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
      const { args } = action.payload
      const key = getKeyFromArgs(args)
      if (!state[endpointName][key]) {
        state[endpointName][key] = initState
      }
      state[endpointName][key].status = Status.LOADING
    },
    [`fetch${capitalize(endpointName)}Error`]: (
      state: ApiState,
      action: FetchErrorAction
    ) => {
      const { args, errorMessage } = action.payload
      const key = getKeyFromArgs(args)
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
      const { args, nonNormalizedData } = action.payload
      const key = getKeyFromArgs(args)
      if (!state[endpointName][key]) {
        state[endpointName][key] = initState
      }
      state[endpointName][key].status = Status.SUCCESS
      state[endpointName][key].nonNormalizedData = nonNormalizedData
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
  const useQuery = (args: any) => {
    const dispatch = useDispatch()
    const key = getKeyFromArgs(args)
    const queryState = useSelector((state: any) => {
      const endpointState: PerEndpointState = state[reducerPath][endpointName]
      if (!endpointState[key]) return null
      let { nonNormalizedData, ...rest } = endpointState[key]

      if (!nonNormalizedData && kind) {
        // TODO: need a smarter way to indicate the id arg
        const idFromArgs = args[0]
        nonNormalizedData = cacheSelectors.getEntry(state, {
          kind,
          id: idFromArgs
        })
      }

      // TODO: Be careful of rerendering because of the new object
      // maybe have override for equality function
      return { nonNormalizedData, ...rest }
    })

    const { nonNormalizedData, status, errorMessage } = queryState ?? {
      nonNormalizedData: null,
      status: Status.IDLE,
      errorMessage: null
    }

    const cachedData = nonNormalizedData

    useEffect(() => {
      const fetchWrapped = async () => {
        if (cachedData) return
        if (status === Status.LOADING) return
        try {
          dispatch(
            // @ts-ignore
            actions[`fetch${capitalize(endpointName)}Loading`]({
              parameters: args
            }) as FetchLoadingAction
          )
          const apiData = await endpoint.fetch(args)
          if (!apiData) {
            throw new Error('Remote data not found')
          }

          const normalized = normalize(apiData, apiResponseSchema)

          const { entities, result } = normalized
          dispatch(addEntries(Object.keys(entities), entities))

          dispatch(
            // @ts-ignore
            actions[`fetch${capitalize(endpointName)}Succeeded`]({
              parameters: args,
              nonNormalizedData: result
            }) as FetchSucceededAction
          )
        } catch (e) {
          dispatch(
            // @ts-ignore
            actions[`fetch${capitalize(endpointName)}Error`]({
              parameters: args,
              errorMessage: getErrorMessage(e)
            }) as FetchErrorAction
          )
        }
      }
      fetchWrapped()
    }, [args, cachedData, dispatch, status])

    return { data: cachedData, status, errorMessage }
  }
  api.hooks[`use${capitalize(endpointName)}`] = useQuery
}

export function capitalize(str: string) {
  return str.replace(str[0], str[0].toUpperCase())
}
