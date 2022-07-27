import type { ReactNode } from 'react'

import type { ID, LineupState, Track, User, Nullable } from '@audius/common'
import { trackRemixesPage } from 'audius-client/src/utils/route'
import { View } from 'react-native'

import { useNavigation } from 'app/hooks/useNavigation'
import type { SearchTrack, SearchUser } from 'app/store/search/types'
import { makeStyles } from 'app/styles'

import { TrackScreenDetailsTile } from './TrackScreenDetailsTile'
import { TrackScreenRemixes } from './TrackScreenRemixes'

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    padding: spacing(3),
    paddingBottom: 0
  },
  headerContainer: {
    marginBottom: spacing(6)
  }
}))

type TrackScreenMainContentProps = {
  lineup: LineupState<{ id: ID }>
  lineupHeader: ReactNode
  remixParentTrack: Nullable<Track & { user: User }>
  track: Track | SearchTrack
  user: User | SearchUser
}

/**
 * `TrackScreenMainContent` includes everything above the Lineup
 */
export const TrackScreenMainContent = ({
  lineup,
  lineupHeader,
  track,
  user
}: TrackScreenMainContentProps) => {
  const navigation = useNavigation()
  const styles = useStyles()

  const remixTrackIds = track._remixes?.map(({ track_id }) => track_id) ?? null

  const handlePressGoToRemixes = () => {
    navigation.push({
      native: { screen: 'TrackRemixes', params: { id: track.track_id } },
      web: { route: trackRemixesPage(track.permalink) }
    })
  }

  return (
    <View style={styles.root}>
      <View style={styles.headerContainer}>
        <TrackScreenDetailsTile
          track={track}
          user={user}
          uid={lineup?.entries?.[0]?.uid}
          isLineupLoading={!lineup?.entries?.[0]}
        />
      </View>

      {track.field_visibility?.remixes &&
        remixTrackIds &&
        remixTrackIds.length > 0 && (
          <TrackScreenRemixes
            trackIds={remixTrackIds}
            onPressGoToRemixes={handlePressGoToRemixes}
            count={track._remixes_count ?? null}
          />
        )}
      {lineupHeader}
    </View>
  )
}
