import { SearchResultsScreen, TagSearchScreen } from '../search-results-screen'
import { SearchScreen } from '../search-screen'

import type { AppTabScreenParamList } from './AppTabScreen'
import { createAppTabScreenStack } from './createAppTabScreenStack'

const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress
  }
})

export type SearchTabScreenParamList = AppTabScreenParamList & {
  Search: undefined
  SearchResults: undefined
  TagSearch: undefined
}

export const SearchTabScreen =
  createAppTabScreenStack<SearchTabScreenParamList>((Stack) => (
    <>
      <Stack.Screen
        name='Search'
        component={SearchScreen}
        options={{
          cardStyleInterpolator: forFade
        }}
      />
      <Stack.Screen name='SearchResults' component={SearchResultsScreen} />
      <Stack.Screen name='TagSearch' component={TagSearchScreen} />
    </>
  ))
