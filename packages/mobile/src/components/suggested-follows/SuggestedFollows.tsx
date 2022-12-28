import { useCallback, useEffect, useRef, useState } from 'react'

import type { User } from '@audius/common'
import { formatCount } from '@audius/common'
import * as signOnActions from 'common/store/pages/signon/actions'
import {
  getFollowArtists,
  makeGetFollowArtists
} from 'common/store/pages/signon/selectors'
import type {
  FollowArtists,
  FollowArtistsCategory
} from 'common/store/pages/signon/types'
import { artistCategories } from 'common/store/pages/signon/types'
import { sampleSize } from 'lodash'
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useDispatch, useSelector } from 'react-redux'
import { useEffectOnce } from 'react-use'

import IconArrow from 'app/assets/images/iconArrow.svg'
import IconWand from 'app/assets/images/iconWand.svg'
import { Button, TextButton } from 'app/components/core'
import { usePressScaleAnimation } from 'app/hooks/usePressScaleAnimation'
import { useThemeColors } from 'app/utils/theme'

import UserBadges from '../../components/user-badges/UserBadges'
import { ProfilePicture } from '../user'

import { ArtistCategoryButton } from './ArtistCategory'
import { PickArtistsForMeButton } from './PickArtistsForMeButton'

const styles = StyleSheet.create({
  container: {
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    flexDirection: 'column'
  },
  containerTop: {
    flex: 0,
    position: 'relative',
    top: 0,
    left: 0,
    width: '100%',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderColor: '#DAD9E0'
  },
  cardsArea: {
    flex: 1,
    backgroundColor: '#F2F2F4',
    width: '100%',
    bottom: 0,
    top: 0,
    paddingBottom: 180
  },
  containerCards: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  containerButton: {
    position: 'absolute',
    left: 0,
    width: '100%',
    alignItems: 'center',
    paddingLeft: 26,
    paddingRight: 26,
    bottom: 0,
    zIndex: 15,
    paddingBottom: 40,
    backgroundColor: 'white'
  },
  title: {
    color: '#7E1BCC',
    fontSize: 18,
    fontFamily: 'AvenirNextLTPro-Bold',
    lineHeight: 26,
    textAlign: 'center'
  },
  formBtn: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 8,
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CC0FE0',
    borderRadius: 4,
    paddingRight: 10,
    paddingLeft: 10
  },
  buttonContainer: {
    marginTop: 24,
    width: '100%'
  },
  buttonContainer2: {
    marginTop: 24
  },
  button: {
    padding: 12
  },
  formButtonTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  arrowIcon: {
    height: 20,
    width: 20
  },
  wandBtn: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  wandButtonTitle: {
    color: '#858199',
    fontSize: 16,
    fontFamily: 'AvenirNextLTPro-DemiBold'
  },
  underline: {
    textDecorationLine: 'underline'
  },
  wandIcon: {
    marginRight: 10
  },
  instruction: {
    color: '#858199',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'AvenirNextLTPro-Regular',
    textAlign: 'center',
    paddingTop: 8,
    paddingBottom: 16,
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15
  },
  pillsContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  animatedPillView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    borderRadius: 8,
    borderColor: '#C2C0CC',
    borderWidth: 1,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    marginLeft: 8,
    lineHeight: 24
  },
  pillActive: {
    borderColor: '#7E1BCC',
    backgroundColor: '#7E1BCC'
  },
  pillText: {
    fontFamily: 'AvenirNextLTPro-Medium',
    textAlign: 'center',
    fontSize: 14,
    color: '#AAA7B8'
  },
  pillTextActive: {
    color: 'white'
  },
  followCounter: {
    color: '#858199',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'AvenirNextLTPro-Regular',
    marginTop: 12
  },
  card: {
    width: 168,
    height: 208,
    borderRadius: 8,
    borderColor: '#6A677A40',
    borderWidth: 0.7,
    backgroundColor: '#FCFCFC',
    color: '#858199',
    marginBottom: 8,
    marginRight: 8,
    marginLeft: 8,
    shadowColor: '#6A677A40',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 5,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  cardTextActive: {
    color: 'white'
  },
  cardNameContainer: {
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingLeft: 8,
    paddingRight: 8
  },
  cardName: {
    color: '#858199',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'AvenirNextLTPro-Bold',
    marginBottom: 8
  },
  cardFollowers: {
    color: '#858199',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'AvenirNextLTPro-Regular',
    paddingHorizontal: 8
  },
  cardImage: {
    height: 120,
    width: 120,
    marginBottom: 14
  }
})

const messages = {
  title: 'Follow At Least 3 Artists To Get Started',
  subTitle:
    'Tracks uploaded or reposted by people you follow will appear in your feed.',
  pickForMe: 'Pick Some For Me',
  following: 'Following',
  continue: 'Continue'
}

const MINIMUM_FOLLOWER_COUNT = 3

const FormTitle = ({ title }: { title: string }) => {
  const [didAnimation, setDidAnimation] = useState(false)
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!didAnimation) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start(() => {
        setDidAnimation(true)
      })
    }
  }, [didAnimation, opacity])

  return (
    <Animated.View style={{ opacity }}>
      <Text style={styles.title}>{title}</Text>
    </Animated.View>
  )
}

const PickForMeButton = ({ active }: { active: boolean }) => {
  return (
    <View style={styles.formButtonTitleContainer}>
      <IconWand
        style={styles.wandIcon}
        fill={'#858199'}
        width={16}
        height={16}
      />
      <Text style={[styles.wandButtonTitle, active ? styles.underline : {}]}>
        {messages.pickForMe}
      </Text>
    </View>
  )
}

const ContinueButton = ({
  onPress,
  disabled
}: {
  onPress: () => void
  disabled: boolean
}) => {
  return (
    <Button
      title={messages.continue}
      style={styles.buttonContainer2}
      size='large'
      fullWidth
      onPress={onPress}
      disabled={disabled}
      icon={IconArrow}
    />
  )
}

export const FollowArtistCard = ({
  user,
  isSelected
}: {
  user: any
  isSelected: boolean
}) => {
  return (
    <View>
      <LinearGradient
        colors={isSelected ? ['#9849d6', '#6516a3'] : ['white', 'white']}
        style={styles.card}
      >
        <ProfilePicture profile={user} style={styles.cardImage} />
        <UserBadges
          style={styles.cardNameContainer}
          nameStyle={[styles.cardName, isSelected ? styles.cardTextActive : {}]}
          user={user}
        />
        <Text
          style={[
            styles.cardFollowers,
            isSelected ? styles.cardTextActive : {}
          ]}
          numberOfLines={1}
        >
          {formatCount(user.follower_count)} Followers
        </Text>
      </LinearGradient>
    </View>
  )
}

type SuggestedFollowsProps = {
  onPress: () => void
  title: string
}

export const SuggestedFollows = ({ onPress, title }: SuggestedFollowsProps) => {
  const dispatch = useDispatch()

  const getSuggestedFollows = makeGetFollowArtists()
  const suggestedFollowArtists: User[] = useSelector(getSuggestedFollows)
  const suggestedFollowArtistsMap = suggestedFollowArtists.reduce(
    (result, user) => ({ ...result, [user.user_id]: user }),
    {}
  )
  const followArtists: FollowArtists = useSelector(getFollowArtists)
  const {
    categories,
    selectedCategory,
    selectedUserIds: followedArtistIds
  } = followArtists
  const [isDisabled, setIsDisabled] = useState(false)
  const [isPickForMeActive, setIsPickForMeActive] = useState(false)
  const pickForMeScale = useRef(new Animated.Value(1)).current
  const cardOpacityRef = useRef(new Animated.Value(1))
  const cardOpacity = cardOpacityRef.current

  useEffectOnce(() => {
    dispatch(signOnActions.fetchAllFollowArtists())
  })

  useEffect(() => {
    setIsDisabled(followedArtistIds.length < MINIMUM_FOLLOWER_COUNT)
  }, [followedArtistIds])

  useEffect(() => {
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 0,
      useNativeDriver: true
    }).start()
  }, [selectedCategory, cardOpacity])

  const toggleFollowedArtist = useCallback(
    (userId: number) => {
      const isSelected = followedArtistIds.includes(userId)
      if (isSelected) {
        dispatch(signOnActions.removeFollowArtists([userId]))
      } else {
        dispatch(signOnActions.addFollowArtists([userId]))
      }
    },
    [followedArtistIds, dispatch]
  )

  const addFollowedArtists = useCallback(
    (userIds: number[]) => {
      const newUserIds = userIds.filter(
        (userId) => !followedArtistIds.includes(userId)
      )
      dispatch(signOnActions.addFollowArtists(newUserIds))
    },
    [followedArtistIds, dispatch]
  )

  // The autoselect or 'pick for me'
  // Selects the first three aritsts in the current category along with 2 additinal
  // random artist from the top 10
  const onPickForMe = () => {
    const selectedIds = new Set(followedArtistIds)

    const toUnselectedUserIds = (users: any[]) =>
      users
        .map((user: any) => user.user_id)
        .filter((userId: number) => !selectedIds.has(userId))

    const firstThreeUserIds = toUnselectedUserIds(
      suggestedFollowArtists.slice(0, 3)
    )
    const suggestedUserIds = toUnselectedUserIds(
      suggestedFollowArtists.slice(3, 10)
    )

    const followUsers = firstThreeUserIds.concat(
      sampleSize(suggestedUserIds, 2)
    )
    addFollowedArtists(followUsers)
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.containerTop}>
            {title ? <FormTitle title={title} /> : null}
            <Text style={styles.instruction}>{messages.subTitle}</Text>
            <View style={styles.pillsContainer}>
              {artistCategories.map((category) => (
                <ArtistCategoryButton
                  key={category}
                  category={category}
                  isSelected={category === selectedCategory}
                />
              ))}
            </View>
          </View>

          <View style={styles.cardsArea}>
            <PickArtistsForMeButton />
            <View style={styles.containerCards}>
              {(categories[selectedCategory] || [])
                .filter((artistId) => suggestedFollowArtistsMap[artistId])
                .map((artistId) => (
                  <Animated.View
                    style={{ opacity: cardOpacity }}
                    key={`${selectedCategory}-${artistId}`}
                  >
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => toggleFollowedArtist(artistId)}
                    >
                      <FollowArtistCard
                        user={suggestedFollowArtistsMap[artistId]}
                        isSelected={followedArtistIds.includes(artistId)}
                      />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.containerButton}>
        <ContinueButton onPress={onPress} disabled={isDisabled} />
        <Text style={styles.followCounter}>
          {`${messages.following} ${
            followedArtistIds.length > MINIMUM_FOLLOWER_COUNT
              ? followedArtistIds.length
              : `${followedArtistIds.length}/${MINIMUM_FOLLOWER_COUNT}`
          }`}
        </Text>
      </View>
    </View>
  )
}
