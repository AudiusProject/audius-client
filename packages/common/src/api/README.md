# audius-query

## Making an api

1. Call `createApi`

   ```typescript
   const userApi = createApi({
     reducerPath: 'userApi',
     endpoints: {
       // ADD ENDPOINT DEFINITION HERE
     }
   })

   export const {
     /* NAMED HOOK EXPORTS */
   } = userApi.hooks
   export default userApi.reducer
   ```

1. Add the reducer export to [reducer.ts](reducer.ts)

## Adding an endpoint

1.  Implement the fetch function

    - `audiusClient` and `audiusBackend` are available from the context argument

    ```typescript
    endpoints: {
        getSomeData: {
            fetch: async (
                    { id } /* fetch args */,
                    { apiClient, audiusBackend } /* context */
                ) => {
                    return await apiClient.getSomeData({ id })
                },
            options: {
                // see below
            }
        }
    }
    ```

1.  Endpoint options

    - **`schemaKey`** - the corresponding key in `apiResponseSchema` see [schema.ts](./schema.ts).

      _Note: A schema key is required, though any unreserved key can be used if the data does not contain any of the entities stored in the entity cache (i.e. any of the `Kinds` from [Kind.ts](/packages/common/src/models/Kind.ts))_

    - **`kind`** - in combination with either `idArgKey` or `permalinkArgKey`, allows cache hits from the entity cache prior to the first remote fetch
      - **`idArgKey`** - must match a key the argument from the fetch function's `fetchArgs` containing the entity's id
      - **`permalinkArgKey`** - must match a key the argument from the fetch function's `fetchArgs` containing the entity's permalink

1.  Export hooks

    A Hooks will automatically be generated for each endpoint, using the naming convention `` [`use${capitalize(endpointName)}`] `` (e.g. `getSomeData` -> `useGetSomeData`)

    ```typescript
    const userApi = createApi({
      endpoints: {
        getSomeData: {
          // ...
        }
      }
    })

    // Export the hook for each endpoint here
    export const { useGetSomeData } = userApi.hooks
    export default userApi.reducer
    ```

## Calling the endpoint

1.  Generated fetch hooks take the same args as the fetch function plus an options object. They return the same type returned by the fetch function.

    ```typescript
    type QueryHook = (
        fetchArgs: /* matches the first argument to the endpoint fetch fn */
        options: {
            disabled: boolean
        }
    ) => {
        data: /* return value from fetch function */
        status: Status
        errorMessage?: string
    }
    ```

1.  In your component

    ```typescript
    const {
      data: someData,
      status,
      errorMessage
    } = useGetSomeData(
      { id: elementId },
      /* optional */ { disabled: !elementId }
    )

    return status === Status.LOADING ? (
      <Loading />
    ) : (
      <DisplayComponent data={someData} />
    )
    ```

## Debugging

- [createApi.ts](./createApi.ts) contains the implementation of the fetch hooks. You can put breakpoints in `useQuery`. Tip: conditional breakpoints are especially useful since the core logic is shared across every audius-query hook. Try `endpoinName === 'myEndpoint && fetchArgs === { ...myArgs }'` to scope down to only your own hook
- Redux debugger - all the data is stored in `state.api['reducerPath']`, and actions are named per endpoint:
  - `fetch${capitalize(endpointName)}Loading`
  - `fetch${capitalize(endpointName)}Succeeded`
  - `fetch${capitalize(endpointName)}Error`

## Pagination (beta)

see [usePaginatedQuery.ts](./hooks/usePaginatedQuery.ts)

- `usePaginatedQuery` - wraps an audius-query fetch hook which accepts `{ limit, offset }` and handles pagination with our common `{ hasMore, loadMore }` pattern. Returns the current page of results
- `useAllPaginatedQuery` - the same as `usePaginatedQuery` but returns the cumulative list of results

Example usage

```typescript
const {
  data: pageOfUsers,
  status,
  loadMore,
  hasMore
} = usePaginatedQuery(
  useGetFollowingUsers /* accepts { userId, limit, offset } */,
  { userId },
  10 /* page size */
)

return status === Status.LOADING ? (
  <Loading />
) : (
  <PaginatedUserTable
    users={pageOfUsers}
    hasMore={hasMore}
    loadMore={loadMore}
  />
)
```

- `hasMore` - true if there are more results available
- `loadMore` - increments the page counter internal to `usePaginatedQuery`, causing the offset to increment and the next page of results to be fetched and returned from the hook
