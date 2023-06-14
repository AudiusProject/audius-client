export enum CreateAppsPages {
  YOUR_APPS = 'your_apps',
  NEW_APP = 'new_app',
  APP_DETAILS = 'app_details'
}

export type CreateAppPageProps<
  Params extends Record<string, unknown> | undefined =
    | Record<string, unknown>
    | undefined
> = {
  setPage: (page: CreateAppsPages, params?: Record<string, unknown>) => void
  params?: Params
}
