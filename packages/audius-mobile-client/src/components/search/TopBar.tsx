import React, { useEffect, useRef, useCallback } from 'react'

import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Platform
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconCaretRight from 'app/assets/images/iconCaretRight.svg'
import IconRemove from 'app/assets/images/iconRemove.svg'
import LoadingSpinner from 'app/components/loading-spinner'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { MessageType } from 'app/message'
import { updateQuery } from 'app/store/search/actions'
import useSearchHistory from 'app/store/search/hooks'
import {
  getSearchQuery,
  getSearchResultQuery
} from 'app/store/search/selectors'
import { getTagSearchRoute } from 'app/utils/routes'
import { useColor, useTheme } from 'app/utils/theme'

import { usePushSearchRoute } from './utils'

const IS_IOS = Platform.OS === 'ios'

const styles = StyleSheet.create({
  topBar: {
    // height + border width should be 87
    height: IS_IOS ? 86 : 55,
    borderBottomWidth: 1
  },
  container: {
    position: 'absolute',
    bottom: 0,
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    paddingLeft: 0,
    paddingRight: 16
  },
  caretContainer: {
    paddingBottom: 6,
    paddingLeft: 6,
    paddingRight: 12
  },
  caret: {
    transform: [{ rotate: '180deg' }]
  },
  removeIcon: {
    position: 'absolute',
    right: 4,
    bottom: -10,
    padding: 16
  },
  loadingIcon: {
    position: 'absolute',
    right: 20,
    bottom: 6,
    width: 24,
    height: 24
  },
  input: {
    position: 'relative',
    flex: 1,
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
    paddingLeft: 8,
    paddingRight: 26,
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 6,
    fontFamily: 'AvenirNextLTPro-Medium'
  }
})

type TopBarProps = {
  isOpen: boolean
  onClose: () => void
}

const TopBar = ({ onClose, isOpen }: TopBarProps) => {
  const color = useColor('neutralLight4')
  const topBarStyle = useTheme(styles.topBar, {
    backgroundColor: color,
    borderBottomColor: 'neutralLight9'
  })

  const inputStyles = useTheme(styles.input, {
    backgroundColor: 'neutralLight10',
    borderColor: 'neutralLight8',
    color: 'neutral'
  })

  const textRef = useRef<TextInput>(null)
  useEffect(() => {
    if (textRef.current) {
      if (isOpen) textRef.current.focus()
      else textRef.current.blur()
    }
  }, [textRef, isOpen])

  const dispatchWeb = useDispatchWeb()
  const { appendSearchItem } = useSearchHistory()
  const query = useSelector(getSearchQuery)
  const dispatch = useDispatch()
  const setQuery = useCallback(
    (text: string) => {
      dispatch(updateQuery(text))
    },
    [dispatch]
  )

  const pushRoute = usePushSearchRoute()

  const onSubmit = useCallback(
    ({ nativeEvent: { text } }) => {
      appendSearchItem(text)
      if (text.startsWith('#')) {
        pushRoute(getTagSearchRoute(text.substring(1)), 'search')
      } else {
        dispatchWeb({
          type: MessageType.UPDATE_SEARCH_QUERY,
          query: text
        })
      }
    },
    [dispatchWeb, pushRoute, appendSearchItem]
  )

  const onChangeText = useCallback(
    (text: string) => {
      setQuery(text)
      if (!text.startsWith('#')) {
        setQuery(text)
        dispatchWeb({
          type: MessageType.UPDATE_SEARCH_QUERY,
          query: text
        })
      }
    },
    [dispatchWeb, setQuery]
  )

  const clearSearch = useCallback(() => {
    setQuery('')
    if (textRef.current) {
      textRef.current.focus()
    }
  }, [textRef, setQuery])

  const searchResultQuery = useSelector(getSearchResultQuery)
  const isTagSearch = query.startsWith('#')
  const hasText = query !== ''
  const isLoading = !isTagSearch && hasText && searchResultQuery !== query
  const spinnerColor = useColor('neutralLight4')

  return (
    <View style={topBarStyle}>
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClose}
          style={styles.caretContainer}
        >
          <IconCaretRight
            width={28}
            height={28}
            fill={color}
            style={styles.caret}
          />
        </TouchableOpacity>
        <TextInput
          ref={textRef}
          value={query}
          onChangeText={onChangeText}
          underlineColorAndroid='transparent'
          style={inputStyles}
          autoComplete='off'
          autoCorrect={false}
          returnKeyType={'search'}
          onSubmitEditing={onSubmit}
        />
        {isLoading && (
          <View style={styles.loadingIcon}>
            <LoadingSpinner color={spinnerColor} />
          </View>
        )}
        {hasText && !isLoading && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={clearSearch}
            style={styles.removeIcon}
          >
            <IconRemove width={24} height={24} fill={color} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default TopBar
