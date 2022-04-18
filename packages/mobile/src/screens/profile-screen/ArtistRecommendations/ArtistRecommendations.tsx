import { Fragment, useCallback } from 'react'

import { FollowSource } from 'audius-client/src/common/models/Analytics'
import {
  followUser,
  unfollowUser
} from 'audius-client/src/common/store/social/users/actions'
import { makeGetRelatedArtists } from 'audius-client/src/common/store/ui/artist-recommendations/selectors'
import { fetchRelatedArtists } from 'audius-client/src/common/store/ui/artist-recommendations/slice'
import { TouchableOpacity, View } from 'react-native'
import { useEffectOnce } from 'react-use'

import IconFollow from 'app/assets/images/iconFollow.svg'
import IconFollowing from 'app/assets/images/iconFollowing.svg'
import IconClose from 'app/assets/images/iconRemove.svg'
import { Button, IconButton, Text } from 'app/components/core'
import { ProfilePicture } from 'app/components/user'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useNavigation } from 'app/hooks/useNavigation'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'
import { EventNames } from 'app/types/analytics'
import { track, make } from 'app/utils/analytics'

import { useSelectProfile } from '../selectors'

import { ArtistLink } from './ArtistLink'

const messages = {
  description: 'Here are some accounts that vibe well with',
  followAll: 'Follow All',
  followingAll: 'Following All'
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    padding: spacing(2)
  },
  header: {
    flexDirection: 'row'
  },
  dismissButton: {
    marginRight: spacing(2)
  },
  dismissIcon: {
    height: 24,
    width: 24,
    fill: palette.neutralLight4
  },
  suggestedArtistsPhotos: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: spacing(2)
  },
  suggestedArtistPhoto: {
    height: 52,
    width: 52,
    marginRight: -7,
    borderWidth: 1
  },
  suggestedArtistsText: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingVertical: spacing(2)
  }
}))

type ArtistRecommendationsProps = {
  onClose: () => void
}

const getRelatedArtistIds = makeGetRelatedArtists()

export const ArtistRecommendations = (props: ArtistRecommendationsProps) => {
  const { onClose } = props
  const styles = useStyles()
  const navigation = useNavigation()
  const { user_id, name } = useSelectProfile(['user_id', 'name'])

  const dispatchWeb = useDispatchWeb()

  useEffectOnce(() => {
    dispatchWeb(fetchRelatedArtists({ userId: user_id }))

    track(
      make({
        eventName: EventNames.PROFILE_PAGE_SHOWN_ARTIST_RECOMMENDATIONS,
        userId: user_id
      })
    )
  })

  const suggestedArtists = useSelectorWeb(
    state => getRelatedArtistIds(state, { id: user_id }),
    (a, b) => a.length === b.length
  )

  const isFollowingAllArtists = suggestedArtists.every(
    artist => artist.does_current_user_follow
  )

  const handlePressFollow = useCallback(() => {
    suggestedArtists.forEach(artist => {
      if (isFollowingAllArtists) {
        dispatchWeb(
          unfollowUser(
            artist.user_id,
            FollowSource.ARTIST_RECOMMENDATIONS_POPUP
          )
        )
      } else {
        dispatchWeb(
          followUser(artist.user_id, FollowSource.ARTIST_RECOMMENDATIONS_POPUP)
        )
      }
    })
  }, [suggestedArtists, isFollowingAllArtists, dispatchWeb])

  const handlePressArtist = useCallback(
    artist => () => {
      navigation.push({
        native: { screen: 'Profile', params: { handle: artist.handle } },
        web: { route: `/${artist.handle}` }
      })
    },
    [navigation]
  )

  const suggestedArtistNames = suggestedArtists.slice(0, 3)

  if (suggestedArtists.length === 0) {
    return null
  }

  return (
    <View pointerEvents='box-none' style={styles.root}>
      <View style={styles.header} pointerEvents='box-none'>
        <IconButton
          icon={IconClose}
          styles={{ root: styles.dismissButton, icon: styles.dismissIcon }}
          fill={styles.dismissIcon.fill}
          onPress={onClose}
        />
        <View pointerEvents='none'>
          <Text variant='body1'>
            {messages.description} {name}
          </Text>
        </View>
      </View>
      <View style={styles.suggestedArtistsPhotos} pointerEvents='box-none'>
        {suggestedArtists.map(artist => (
          <TouchableOpacity
            onPress={handlePressArtist(artist)}
            key={artist.user_id}
          >
            <ProfilePicture
              profile={artist}
              style={styles.suggestedArtistPhoto}
            />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.suggestedArtistsText} pointerEvents='box-none'>
        <View pointerEvents='none'>
          <Text variant='body1'>Featuring </Text>
        </View>
        {suggestedArtistNames.map(artist => (
          <Fragment key={artist.user_id}>
            <ArtistLink artist={artist} onPress={handlePressArtist(artist)} />
            <Text variant='body1'>, </Text>
          </Fragment>
        ))}
        <View pointerEvents='none'>
          <Text variant='body1'>{`and ${
            suggestedArtists.length - suggestedArtistNames.length
          } others`}</Text>
        </View>
      </View>
      <Button
        variant='primary'
        title={
          isFollowingAllArtists ? messages.followingAll : messages.followAll
        }
        icon={isFollowingAllArtists ? IconFollowing : IconFollow}
        iconPosition='left'
        fullWidth
        size='small'
        onPress={handlePressFollow}
      />
    </View>
  )
}
