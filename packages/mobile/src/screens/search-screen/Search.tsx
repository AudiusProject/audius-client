import { useCallback, useEffect, useRef, useState } from 'react'

import { Nullable } from 'audius-client/src/common/utils/typeUtils'
import { StyleSheet, Animated, View, Text } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import Header from 'app/components/header/Header'
import useAppState from 'app/hooks/useAppState'
import useLocation from 'app/hooks/useLocation'
import { useNavigation } from 'app/hooks/useNavigation'
import { usePushRouteWeb } from 'app/hooks/usePushRouteWeb'
import ProfileScreen from 'app/screens/profile-screen'
import { TrackScreen } from 'app/screens/track-screen'
import * as searchActions from 'app/store/search/actions'
import {
  getIsOpen,
  getSearchQuery,
  getSearchResultQuery,
  getSearchResults
} from 'app/store/search/selectors'
import { getEmptyPageRoute } from 'app/utils/routes'
import { useTheme } from 'app/utils/theme'

import SearchHistory from './SearchHistory'
import SearchResults from './SearchResults'
import TopBar from './TopBar'
import EmptySearch from './content/EmptySearch'

const FADE_DURATION = 80

const styles = StyleSheet.create({
  animator: {
    flex: 1,
    // position: 'absolute',
    // left: 0,
    // top: 0,
    // width: '100%',
    // height: '100%',
    elevation: 1,
    zIndex: 2
  },
  container: {
    flex: 1,
    // position: 'absolute',
    // left: 0,
    // top: 0,
    // width: '100%',
    // height: '100%',
    zIndex: 3
  }
})

export const SearchScreen = () => {
  console.log('search screen is rendered')
  const dispatch = useDispatch()
  const isOpen = true // useSelector(getIsOpen)
  const close = useCallback(() => dispatch(searchActions.close()), [dispatch])

  const [anchorRoute, setAnchorRoute] = useState<string | null>(null)
  const [viewDisplay, setViewDisplay] = useState<'none' | 'flex'>('none')
  const [didOpen, setDidOpen] = useState<boolean>(false)

  const { pathname } = useLocation() || {}

  const pushWebRouteNoClose = usePushRouteWeb()
  useEffect(() => {
    setDidOpen(true)
    pushWebRouteNoClose(getEmptyPageRoute(), 'search')
    return () => {
      setDidOpen(false)
    }
  }, [])

  // const pushWebRouteNoClose = usePushRouteWeb()
  // const fadeAnim = useRef(new Animated.Value(0)).current
  // const fadeIn = useCallback(() => {
  //   setViewDisplay('flex')
  //   Animated.timing(fadeAnim, {
  //     toValue: 1,
  //     duration: FADE_DURATION,
  //     useNativeDriver: true
  //   }).start(({ finished }) => {
  //     if (finished) {
  //       setDidOpen(true)
  //       pushWebRouteNoClose(getEmptyPageRoute(), 'search')
  //     }
  //   })
  // }, [fadeAnim, setViewDisplay, setDidOpen, pushWebRouteNoClose])

  // const fadeOut = useCallback(() => {
  //   Animated.timing(fadeAnim, {
  //     toValue: 0,
  //     delay: 80,
  //     duration: FADE_DURATION,
  //     useNativeDriver: true
  //   }).start(() => {
  //     setDidOpen(false)
  //     setViewDisplay('none')
  //   })
  // }, [fadeAnim, setViewDisplay, setDidOpen])

  // On App enter foreground/background
  // useAppState(
  //   () => {},
  //   () => {
  //     if (isOpen) {
  //       fadeIn()
  //       if (!anchorRoute) setAnchorRoute(pathname)
  //     } else {
  //       fadeOut()
  //     }
  //   }
  // )

  // useEffect(() => {
  //   if (isOpen) {
  //     fadeIn()
  //     if (!anchorRoute) setAnchorRoute(pathname)
  //   } else {
  //     fadeOut()
  //   }
  // }, [isOpen, fadeIn, fadeOut, fadeAnim, pathname, anchorRoute, setAnchorRoute])

  // const pushWebRoute = usePushRouteWeb(close)
  const navigation = useNavigation()

  const onClose = useCallback(() => {
    // TODO: Figure out how to go back
    // navigation.goBack()
    navigation.navigate({
      native: { screen: 'main', params: undefined },
      web: { route: 'trending' }
    })
  }, [navigation])

  const containerStyle = useTheme(styles.container, {
    backgroundColor: 'white'
  })

  const searchQuery = useSelector(getSearchQuery)
  const searchResultQuery = useSelector(getSearchResultQuery)
  const searchResults = useSelector(getSearchResults)
  const hasResults = Object.values(searchResults).some(
    result => result && result.length > 0
  )
  let body: Nullable<JSX.Element> = null
  if (!!searchQuery && hasResults) {
    body = <SearchResults />
  } else if (!!searchQuery && !!searchResultQuery && !hasResults) {
    body = <EmptySearch query={searchResultQuery} />
  } else {
    body = <SearchHistory />
  }

  return (
    <View style={containerStyle}>
      <TopBar onClose={onClose} isOpen={didOpen} />
      <Header text='Search' />
      {body}
    </View>
  )
}

export default SearchScreen
