import { useCallback, useRef, useState } from 'react'

import { TextInput } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconClose from 'app/assets/images/iconRemove.svg'
import { SearchInput } from 'app/components/core'
import LoadingSpinner from 'app/components/loading-spinner'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { MessageType } from 'app/message'
import { updateQuery } from 'app/store/search/actions'
import {
  getSearchQuery,
  getSearchResultQuery
} from 'app/store/search/selectors'

export const SearchBar = () => {
  const query = useSelector(getSearchQuery)
  const dispatch = useDispatch()
  const dispatchWeb = useDispatchWeb()
  const [shouldDisplayClearQuery, setShoulDisplayClearQuery] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const handleChangeText = useCallback(
    (text: string) => {
      dispatch(updateQuery(text))
      if (!text.startsWith('#')) {
        dispatchWeb({
          type: MessageType.UPDATE_SEARCH_QUERY,
          query: text
        })
      }
      if (text !== '') {
        setShoulDisplayClearQuery(true)
      }
    },
    [dispatch, dispatchWeb, setShoulDisplayClearQuery]
  )

  const onPressIcon = useCallback(() => {
    dispatch(updateQuery(''))
    setShoulDisplayClearQuery(false)
    inputRef.current?.focus()
  }, [dispatch, setShoulDisplayClearQuery])

  const searchResultQuery = useSelector(getSearchResultQuery)
  const isTagSearch = query.startsWith('#')
  const hasText = query !== ''
  const isLoading = !isTagSearch && hasText && searchResultQuery !== query
  const icon = isLoading
    ? LoadingSpinner
    : shouldDisplayClearQuery
    ? IconClose
    : undefined

  return (
    <SearchInput
      autoFocus
      ref={inputRef}
      value={query}
      onChangeText={handleChangeText}
      Icon={icon}
      onPressIcon={shouldDisplayClearQuery ? onPressIcon : undefined}
    />
  )
}
