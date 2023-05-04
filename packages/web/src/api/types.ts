import { Kind, Status } from '@audius/common'
import {
  Action,
  CreateSliceOptions,
  PayloadAction,
  Reducer
} from '@reduxjs/toolkit'

export type Api = {
  reducer: Reducer<any, Action>
  hooks: {
    [key: string]: (...fetchArgs: any[]) => any
  }
}

export type SliceConfig = CreateSliceOptions<any, any, any>

type EndpointOptions = {}

export type EndpointConfig = {
  fetch: (fetchArgs: any) => Promise<any>
  options?: EndpointOptions
}

export type EntityMap = {
  [key: string]:
    | {
        [key: string]: any
      }
    | undefined
}
export type StrippedEntityMap = {
  [x: string]: string[] | undefined
}

type FetchBaseAction = {
  fetchArgs: any[]
}
export type FetchLoadingAction = PayloadAction<FetchBaseAction & {}>
export type FetchErrorAction = PayloadAction<
  FetchBaseAction & {
    errorMessage: string
  }
>
export type FetchSucceededAction = PayloadAction<
  FetchBaseAction & {
    id: any
    nonNormalizedData: any
    strippedEntityMap: StrippedEntityMap
  }
>

export type PerKeyState = {
  status: Status
  nonNormalizedData?: any
  strippedEntityMap?: StrippedEntityMap
  errorMessage?: string
}

export type PerEndpointState = {
  [key: string]: PerKeyState
}

export type ApiState = {
  [key: string]: PerEndpointState
}

export type CreateApiConfig = {
  reducerPath: string
  endpoints: { [name: string]: EndpointConfig }
  kind?: Kind
}
