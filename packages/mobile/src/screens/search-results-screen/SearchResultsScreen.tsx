import { Dimensions, View } from 'react-native'

import Header from 'app/components/header/Header'

import { SearchResultsTabManager } from './SearchResultsTabManager'

const screenHeight = Dimensions.get('window').height

const messages = {
  header: 'More Results'
}

export const SearchResultsScreen = () => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: screenHeight,
        marginTop: 30
      }}
    >
      <Header text={messages.header} />
      <SearchResultsTabManager />
    </View>
  )
}
