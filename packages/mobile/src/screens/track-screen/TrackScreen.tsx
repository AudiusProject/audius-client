import { useCallback } from 'react'

import { LineupState } from 'audius-client/src/common/models/Lineup'
import { Track } from 'audius-client/src/common/models/Track'
import { User } from 'audius-client/src/common/models/User'
import { makeGetLineupMetadatas } from 'audius-client/src/common/store/lineup/selectors'
import { tracksActions } from 'audius-client/src/common/store/pages/track/lineup/actions'
import {
  getLineup,
  getTrack,
  getUser
} from 'audius-client/src/common/store/pages/track/selectors'
import { trackRemixesPage } from 'audius-client/src/utils/route'
import { isEqual } from 'lodash'
import { StyleSheet, View } from 'react-native'

import { Screen } from 'app/components/core'
import { Lineup } from 'app/components/lineup'
import Text from 'app/components/text'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { usePushRouteWeb } from 'app/hooks/usePushRouteWeb'
import { useRoute } from 'app/hooks/useRoute'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { ThemeColors } from 'app/utils/theme'

import { TrackScreenDetailsTile } from './TrackScreenDetailsTile'
import { TrackScreenRemixes } from './TrackScreenRemixes'

const getMoreByArtistLineup = makeGetLineupMetadatas(getLineup)

const messages = {
  moreBy: 'More By',
  originalTrack: 'Original Track',
  viewOtherRemixes: 'View Other Remixes'
}

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    root: {
      padding: 12
    },
    headerContainer: {
      marginBottom: 24
    },
    lineupHeader: {
      width: '100%',
      textAlign: 'center',
      color: themeColors.neutralLight3,
      fontSize: 14,
      marginTop: 36,
      textTransform: 'uppercase'
    }
  })

type TrackScreenMainContentProps = {
  lineup: LineupState<Track>
  track: Track
  user: User
}

/**
 * `TrackScreenMainContent` includes everything above the Lineup
 */
const TrackScreenMainContent = ({
  lineup,
  track,
  user
}: TrackScreenMainContentProps) => {
  console.log({ lineup, track, user })
  const styles = useThemedStyles(createStyles)
  const pushRouteWeb = usePushRouteWeb()

  const remixParentTrackId = track.remix_of?.tracks?.[0]?.parent_track_id
  const remixTrackIds = track._remixes?.map(({ track_id }) => track_id) ?? null
  const showMoreByArtistTitle =
    (remixParentTrackId && lineup.entries.length > 2) ||
    (!remixParentTrackId && lineup.entries.length > 1)

  const moreByArtistTitle = showMoreByArtistTitle && (
    <Text
      style={styles.lineupHeader}
      weight='bold'
    >{`${messages.moreBy} ${user?.name}`}</Text>
  )

  const goToAllRemixes = () => {
    // TODO: sk - implement this page in RN
    pushRouteWeb(trackRemixesPage(track.permalink))
  }

  return (
    <View style={styles.root}>
      <View style={styles.headerContainer}>
        <TrackScreenDetailsTile
          track={track}
          user={user}
          uid={lineup?.entries?.[0]?.uid}
        />
      </View>

      {track.field_visibility?.remixes &&
        remixTrackIds &&
        remixTrackIds.length > 0 && (
          <TrackScreenRemixes
            trackIds={remixTrackIds}
            goToAllRemixes={goToAllRemixes}
            count={track._remixes_count ?? null}
          />
        )}
      {moreByArtistTitle}
    </View>
  )
}

/**
 * `TrackScreen` displays a single track and a Lineup of more tracks by the artist
 */
export const TrackScreen = () => {
  const { params } = useRoute<'Track'>()
  const dispatchWeb = useDispatchWeb()
  const track = useSelectorWeb(state => getTrack(state, params))
  const user = useSelectorWeb(state => getUser(state, { id: track?.owner_id }))
  const lineup = useSelectorWeb(getMoreByArtistLineup, isEqual)

  const ownerHandle = user?.handle
  const permalink = track?.permalink

  const loadMore = useCallback(
    (offset: number, limit: number, overwrite: boolean) => {
      console.log(offset, limit, overwrite)
      dispatchWeb(
        tracksActions.fetchLineupMetadatas(offset, limit, overwrite, {
          ownerHandle,
          permalink
        })
      )
    },
    [dispatchWeb, ownerHandle, permalink]
  )

  if (!track || !user || !lineup) {
    console.warn(
      'Track, user, or lineup missing for TrackScreen, preventing render'
    )
    return null
  }

  return (
    <Screen noPadding>
      <Lineup
        loadMore={loadMore}
        actions={tracksActions}
        count={6}
        header={
          <TrackScreenMainContent track={track} user={user} lineup={lineup} />
        }
        lineup={lineup}
      />
    </Screen>
  )
}
