import {
  Action,
  CreateSliceOptions,
  PayloadAction,
  Reducer
} from '@reduxjs/toolkit'

import { Kind, Status } from 'models'

import { AudiusQueryContextType } from './AudiusQueryContext'

export type DefaultEndpointDefinitions<
  SchemaKey extends string,
  SchemaReturn,
  argsT,
  dataT extends { [key in SchemaKey]: SchemaReturn }
> = {
  [key: string]: EndpointConfig<SchemaKey, SchemaReturn, argsT, dataT>
}

export type Api<
  SchemaKey extends string,
  SchemaReturn,
  argsT,
  dataT extends { [key in SchemaKey]: SchemaReturn },
  EndpointDefinitions extends DefaultEndpointDefinitions<
    SchemaKey,
    SchemaReturn,
    argsT,
    dataT
  >
> = {
  reducer: Reducer<any, Action>
  hooks: {
    [Property in keyof EndpointDefinitions as `use${Capitalize<
      string & Property
    >}`]: (
      fetchArgs: Parameters<EndpointDefinitions[Property]['fetch']>[0]
    ) => ReturnType<
      EndpointDefinitions[Property]['fetch']
    >[EndpointDefinitions[Property]['options']['schemaKey']]

    // EndpointDefinitions[Property]['options']['schemaKey'] extends string
    //   ? ReturnType<
    //       EndpointDefinitions[Property]['fetch']
    //     >[EndpointDefinitions[Property]['options']['schemaKey']]
    //   : ReturnType<EndpointDefinitions[Property]['fetch']>
  }
}

export type SliceConfig = CreateSliceOptions<any, any, any>

type EndpointOptions<SchemaKey extends string> = {
  idArgKey?: string
  schemaKey: SchemaKey
  kind?: Kind
}

export type EndpointConfig<
  SchemaKey extends string,
  SchemaReturn,
  argsT,
  dataT extends { [key in SchemaKey]: SchemaReturn }
> = {
  fetch: (fetchArgs: argsT, context: AudiusQueryContextType) => Promise<dataT>
  options: EndpointOptions<SchemaKey>
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
  endpoints: { [name: string]: EndpointConfig<any, any> }
}
