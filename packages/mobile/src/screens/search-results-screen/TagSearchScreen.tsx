import { useEffect, useMemo } from 'react'

import { useIsFocused } from '@react-navigation/native'

import IconNote from 'app/assets/images/iconNote.svg'
import IconUser from 'app/assets/images/iconUser.svg'
import { Screen, Tag } from 'app/components/core'
import { Header } from 'app/components/header'
import { TabNavigator, tabScreen } from 'app/components/top-tab-bar'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useRoute } from 'app/hooks/useRoute'
import { MessageType } from 'app/message'
import { makeStyles } from 'app/styles'

import { SearchFocusContext } from './SearchFocusContext'
import { ProfilesTab } from './tabs/ProfilesTab'
import { TracksTab } from './tabs/TracksTab'

const messages = {
  header: 'Tag Search'
}

const useStyles = makeStyles(({ spacing }) => ({
  headerRoot: {
    justifyContent: undefined,
    alignItems: 'center'
  },
  tag: {
    marginLeft: spacing(4)
  }
}))

/**
 * Displays tag search results. Uses the same state as normal full search,
 * but only displays matching tracks & profiles.
 */
export const TagSearchScreen = () => {
  const styles = useStyles()
  const isFocused = useIsFocused()
  const focusContext = useMemo(() => ({ isFocused }), [isFocused])
  const dispatchWeb = useDispatchWeb()
  const { params } = useRoute<'TagSearch'>()
  const { query } = params

  useEffect(() => {
    dispatchWeb({
      type: MessageType.UPDATE_SEARCH_QUERY,
      query
    })
  }, [dispatchWeb, query])

  const tracksScreen = tabScreen({
    name: 'Tracks',
    Icon: IconNote,
    component: TracksTab
  })

  const profilesScreen = tabScreen({
    name: 'Profiles',
    Icon: IconUser,
    component: ProfilesTab
  })

  return (
    <Screen topbarRight={null}>
      <Header text={messages.header} styles={{ root: styles.headerRoot }}>
        <Tag style={styles.tag}>{query.replace(/^#/, '')}</Tag>
      </Header>
      <SearchFocusContext.Provider value={focusContext}>
        <TabNavigator initialScreenName='Tracks'>
          {tracksScreen}
          {profilesScreen}
        </TabNavigator>
      </SearchFocusContext.Provider>
    </Screen>
  )
}
