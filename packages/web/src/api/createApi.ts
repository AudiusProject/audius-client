import { useEffect } from 'react'

import { getErrorMessage, Status } from '@audius/common'
import {
  Action,
  CaseReducerActions,
  createSlice,
  CreateSliceOptions,
  PayloadAction,
  Reducer
} from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'

type Api = {
  reducer: Reducer<any, Action>
  hooks: {
    [key: string]: (...args: any[]) => any
  }
}

type SliceConfig = CreateSliceOptions<any, any, any>

type Endpoint = (...args: any[]) => Promise<any>

type FetchBaseAction = {
  parameters: any[]
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
  endpoints: { [name: string]: Endpoint }
}

export const createApi = ({ reducerPath, endpoints }: CreateApiConfig) => {
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
    buildEndpointHooks(api, name, endpoint, slice.actions, reducerPath)
  }

  api.reducer = slice.reducer

  return api
}

const canonincalizeParametersDefault = (parameters: any[]) => {
  return parameters.map((parameters) => parameters.toString()).join(';')
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
      const { parameters } = action.payload
      const key = canonincalizeParametersDefault(parameters)
      if (!state[endpointName][key]) {
        state[endpointName][key] = initState
      }
      state[endpointName][key].status = Status.LOADING
    },
    [`fetch${capitalize(endpointName)}Error`]: (
      state: ApiState,
      action: FetchErrorAction
    ) => {
      const { parameters, errorMessage } = action.payload
      const key = canonincalizeParametersDefault(parameters)
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
      const { parameters, nonNormalizedData } = action.payload
      const key = canonincalizeParametersDefault(parameters)
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
  endpoint: Endpoint,
  actions: CaseReducerActions<any>,
  reducerPath: string
) => {
  const useQuery = (...args: any[]) => {
    const dispatch = useDispatch()
    const key = canonincalizeParametersDefault(args)
    const queryState = useSelector((state: any) => {
      const endpointState: PerEndpointState = state[reducerPath][endpointName]
      return endpointState[key]
    })
    const { nonNormalizedData, status, errorMessage } = queryState ?? {
      nonNormalizedData: null,
      status: Status.IDLE,
      errorMessage: null
    }

    // if nonNormalizedData is just an id, get it from cache
    const cachedData = nonNormalizedData

    useEffect(() => {
      const fetchWrapped = async () => {
        if (cachedData) return
        if (status === Status.LOADING) return
        try {
          // dispatch loading
          dispatch(
            // @ts-ignore
            actions[`fetch${capitalize(endpointName)}Loading`]({
              parameters: args
            }) as FetchLoadingAction
          )
          const apiData = await endpoint(...args)
          if (!apiData) {
            throw new Error('User not found')
          }

          // TODO: normalize
          // TODO: cache normalized data
          const nonNormalizedData = apiData
          dispatch(
            // @ts-ignore
            actions[`fetch${capitalize(endpointName)}Succeeded`]({
              parameters: args,
              nonNormalizedData
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
