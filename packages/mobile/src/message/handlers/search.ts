import { CommonActions } from '@react-navigation/native'

import * as searchActions from 'app/store/search/actions'

import { MessageType, MessageHandlers } from '../types'

export const messageHandlers: Partial<MessageHandlers> = {
  [MessageType.OPEN_SEARCH]: ({ message, dispatch }) => {
    // dispatch(searchActions.open(message.reset))
    dispatch(
      CommonActions.navigate('main', {
        name: 'search',
        params: undefined
      })
    )
  },
  [MessageType.FETCH_SEARCH_SUCCESS]: ({ message, dispatch }) => {
    dispatch(
      searchActions.setResults({
        query: message.query,
        results: message.results
      })
    )
  },
  [MessageType.FETCH_SEARCH_FAILURE]: ({ message, dispatch }) => {
    dispatch(searchActions.fetchSearchFailed({ query: message.query }))
  }
}
