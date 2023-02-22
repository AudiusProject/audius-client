import { Dimensions, View } from 'react-native'

import { NativeDrawer } from 'app/components/drawer'
import { Text } from 'app/components/core'
import { cacheTracksSelectors, cacheUsersSelectors, CommonState, premiumContentSelectors, SquareSizes, Track, usePremiumContentAccess, User } from '@audius/common'
import IconLock from 'app/assets/images/iconLock.svg'
import IconCollectible from 'app/assets/images/iconCollectible.svg'
import IconSpecialAccess from 'app/assets/images/iconSpecialAccess.svg'
import { useColor } from 'app/utils/theme'
import { flexRowCentered, typography } from 'app/styles'
import { makeStyles } from 'app/styles'
import { DetailsTilePremiumAccess } from 'app/components/details-tile/DetailsTilePremiumAccess'
import { useSelector } from 'react-redux'
import { TrackImage } from 'app/components/image/TrackImage'
import UserBadges from 'app/components/user-badges'

const LOCKED_CONTENT_MODAL_NAME = 'LockedContent'

const screenWidth = Dimensions.get('screen').width

const { getUser } = cacheUsersSelectors
const { getTrack } = cacheTracksSelectors
const { getLockedContentId } = premiumContentSelectors

const messages = {
  howToUnlock: 'HOW TO UNLOCK',
  collectibleGated: 'COLLECTIBLE GATED',
  specialAccess: 'SPECIAL ACCESS'
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  drawer: {
    marginVertical: spacing(8),
    alignItems: 'center'
  },
  titleContainer: {
    ...flexRowCentered(),
    marginBottom: spacing(6)
  },
  titleText: {
    marginLeft: spacing(3),
    fontFamily: typography.fontByWeight.heavy,
    fontSize: typography.fontSize.medium,
    color: palette.neutralLight2
  },
  trackDetails: {
    ...flexRowCentered(),
    width: screenWidth - spacing(8),
    marginBottom: spacing(8),
    padding: spacing(2),
    backgroundColor: palette.neutralLight10,
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: spacing(2)
  },
  trackImage: {
    marginRight: spacing(2),
    width: spacing(22),
    height: spacing(22),
    borderRadius: spacing(1)
  },
  premiumContentLabelContainer: {
    ...flexRowCentered(),
    marginBottom: spacing(4)
  },
  premiumContentLabel: {
    marginLeft: spacing(2),
    fontFamily: typography.fontByWeight.demiBold,
    fontSize: typography.fontSize.small,
    color: palette.accentBlue,
    letterSpacing: spacing(0.5)
  },
  trackName: {
    marginBottom: spacing(2),
    fontFamily: typography.fontByWeight.bold,
    fontSize: typography.fontSize.medium,
    textTransform: 'capitalize',
  },
  trackOwnerContainer: {
    ...flexRowCentered()
  },
  trackOwner: {
    fontFamily: typography.fontByWeight.medium,
    fontSize: typography.fontSize.medium
  },
  premiumTrackSection: {
    marginBottom: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  }
}))

type TrackDetailsProps = {
  track: Track,
  owner: User
}

const TrackDetails = ({ track, owner}: TrackDetailsProps) => {
  const styles = useStyles()
  const accentBlue = useColor('accentBlue')
  const isCollectibleGated = !!track.premium_conditions?.nft_collection

  return (
    <View style={styles.trackDetails}>
      <TrackImage style={styles.trackImage} track={track} size={SquareSizes.SIZE_150_BY_150} />
      <View>
        <View style={styles.premiumContentLabelContainer}>
          {isCollectibleGated ? <IconCollectible fill={accentBlue} width={24} height={24} /> : <IconSpecialAccess fill={accentBlue} width={24} height={24} />}
          <Text style={styles.premiumContentLabel}>{isCollectibleGated ? messages.collectibleGated : messages.specialAccess}</Text>
        </View>
        <Text style={styles.trackName}>{track.title}</Text>
        <View style={styles.trackOwnerContainer}>
          <Text style={styles.trackOwner}>{owner.name}</Text>
          <UserBadges
            badgeSize={16}
            user={owner}
            hideName
          />
        </View>
      </View>
    </View>
  )
}

export const LockedContentDrawer = () => {
  const styles = useStyles()
  const neutralLight2 = useColor('neutralLight2')
  const lockedContentId = useSelector(getLockedContentId)
  const track = useSelector((state: CommonState) => {
    return lockedContentId ? getTrack(state, { id: lockedContentId }) : null
  })
  const owner = useSelector((state: CommonState) => {
    return track?.owner_id ? getUser(state, { id: track.owner_id }) : null
  })
  const { doesUserHaveAccess } = usePremiumContentAccess(track)

  if (!lockedContentId || !track || !track.premium_conditions || !owner) {
    return null
  }

  return (
    <NativeDrawer drawerName={LOCKED_CONTENT_MODAL_NAME}>
      <View style={styles.drawer}>
        <View style={styles.titleContainer}>
          <IconLock fill={neutralLight2} width={24} height={24} />
          <Text style={styles.titleText} weight='heavy' color='neutral'>{messages.howToUnlock}</Text>
        </View>
        <TrackDetails track={track} owner={owner} />
        <DetailsTilePremiumAccess
          style={styles.premiumTrackSection}
          trackId={track.track_id}
          premiumConditions={track.premium_conditions}
          isOwner={false}
          doesUserHaveAccess={doesUserHaveAccess}
        />
      </View>
    </NativeDrawer>
  )
}
