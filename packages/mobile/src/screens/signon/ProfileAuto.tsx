import { useCallback, useEffect, useState } from 'react'

import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as signOnActions from 'common/store/pages/signon/actions'
import {
  getEmailField,
  getHandleField
} from 'common/store/pages/signon/selectors'
import { EditingStatus } from 'common/store/pages/signon/types'
import type { EditableField } from 'common/store/pages/signon/types'
import { Animated, View, TouchableOpacity, SafeAreaView } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import GradientSave from 'app/assets/images/gradientSave.svg'
import IconImage from 'app/assets/images/iconImage.svg'
import IconInstagram from 'app/assets/images/iconInstagram.svg'
import IconTwitter from 'app/assets/images/iconTwitterBird.svg'
import IconUser from 'app/assets/images/iconUser.svg'
import IconVerified from 'app/assets/images/iconVerified.svg'
import { Button, Text } from 'app/components/core'
import LoadingSpinner from 'app/components/loading-spinner'
import { track, make } from 'app/services/analytics'
import * as oauthActions from 'app/store/oauth/actions'
import {
  getInstagramError,
  getInstagramInfo,
  getTwitterError,
  getTwitterInfo,
  getAbandoned
} from 'app/store/oauth/selectors'
import { makeStyles } from 'app/styles'
import { EventNames } from 'app/types/analytics'
import { useThemeColors } from 'app/utils/theme'

import SignupHeader from './SignupHeader'
import type { SignOnStackParamList } from './types'

const useStyles = makeStyles(({ palette, spacing }) => ({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: palette.staticWhite,
    paddingTop: spacing(10)
  },
  containerForm: {
    alignItems: 'center',
    padding: spacing(7)
  },
  header: {
    color: palette.secondary,
    textAlign: 'center',
    paddingBottom: spacing(3)
  },
  socialButtonContainer: {},
  socialButton: {
    padding: spacing(3),
    height: 64
  },
  buttonText: {
    fontSize: 20
  },
  tile: {
    width: '100%',
    backgroundColor: palette.neutralLight10,
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: 8,
    padding: spacing(4),
    paddingBottom: spacing(6),
    marginBottom: spacing(6)
  },
  tileHeader: { marginBottom: spacing(1), textTransform: 'uppercase' },
  tileListItem: {
    marginTop: spacing(2),
    flexDirection: 'row',
    alignItems: 'center'
  },
  tileListItemText: {
    flex: 1
  },
  tileListItemIconCircle: {
    marginRight: spacing(2),
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.secondary,
    borderRadius: 100
  },
  verifiedIcon: {
    marginRight: spacing(4)
  },
  manualButtonText: {
    color: palette.secondaryLight2
  },
  loadingIcon: {
    alignItems: 'center',
    marginTop: 48,
    height: 48
  }
}))

const messages = {
  instagramButton: 'Complete with Instagram',
  twitterButton: 'Complete with Twitter',
  tiktokButton: 'Complete with TikTok',
  header: 'Quickly Complete Your Account by Linking Your Other Socials',
  importTileHeader: 'We will import these details',
  importTileItemHandle: 'Handle & Display Name',
  importTileItemPicture: 'Profile Picture & Cover Photo',
  verifiedTileHeader: 'Verified?',
  verifiedTileContent:
    'If the linked account is verified, your Audius account will be verified to match!',
  manual: "I'd rather fill out my profile manually"
}

let didAnimation = false

const FormTitle = () => {
  const styles = useStyles()
  let opacity = new Animated.Value(1)
  if (!didAnimation) {
    opacity = new Animated.Value(0)
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start(() => {
      didAnimation = true
    })
  }
  return (
    <Animated.View style={{ opacity }}>
      <Text variant={'h1'} style={styles.header}>
        {messages.header}
      </Text>
    </Animated.View>
  )
}

const TwitterButton = ({ onPress }: { onPress: () => void }) => {
  const styles = useStyles()
  return (
    <View style={styles.socialButtonContainer}>
      <Button
        icon={IconTwitter}
        iconPosition={'left'}
        title={messages.twitterButton}
        onPress={onPress}
        color={'#1BA1F1'}
        fullWidth
        styles={{
          icon: { height: 20, width: 20, marginRight: 12 },
          button: [styles.socialButton],
          root: styles.socialButtonContainer,
          text: styles.buttonText
        }}
      />
    </View>
  )
}

const InstagramButton = ({ onPress }: { onPress: () => void }) => {
  const styles = useStyles()
  return (
    <View style={styles.socialButtonContainer}>
      <Button
        icon={IconInstagram}
        iconPosition={'left'}
        title={messages.instagramButton}
        onPress={onPress}
        styles={{
          icon: { height: 20, width: 20, marginRight: 12 },
          button: [styles.socialButton],
          root: styles.socialButtonContainer,
          text: styles.buttonText
        }}
      />
    </View>
  )
}

type ProfileAutoProps = NativeStackScreenProps<
  SignOnStackParamList,
  'ProfileAuto'
>
const ProfileAuto = ({ navigation }: ProfileAutoProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const { neutralLight4, staticWhite } = useThemeColors()
  const twitterInfo = useSelector(getTwitterInfo)
  const twitterError = useSelector(getTwitterError)
  const instagramInfo = useSelector(getInstagramInfo)
  const instagramError = useSelector(getInstagramError)
  const abandoned = useSelector(getAbandoned)
  const handleField: EditableField = useSelector(getHandleField)
  const emailField: EditableField = useSelector(getEmailField)

  const [isLoading, setIsLoading] = useState(false)
  const [hasNavigatedAway, setHasNavigatedAway] = useState(false)
  const [didValidateHandle, setDidValidateHandle] = useState(false)

  const goTo = useCallback(
    (page: 'ProfileManual' | 'FirstFollows') => {
      navigation.replace(page)
    },
    [navigation]
  )

  const validateHandle = useCallback(
    (type: 'twitter' | 'instagram') => {
      const info = type === 'twitter' ? twitterInfo : instagramInfo
      if (!info) {
        return
      }
      const { profile } = info
      const handle = type === 'twitter' ? profile.screen_name : profile.username
      const verified =
        type === 'twitter' ? profile.verified : profile.is_verified
      dispatch(signOnActions.validateHandle(handle, verified))
    },
    [dispatch, twitterInfo, instagramInfo]
  )

  const trackOAuthComplete = useCallback(
    (type: 'twitter' | 'instagram') => {
      const info = type === 'twitter' ? twitterInfo : instagramInfo
      if (!info) {
        return
      }
      const { profile } = info

      const handle = type === 'twitter' ? profile.screen_name : profile.username
      const isVerified =
        type === 'twitter' ? profile.verified : profile.is_verified
      const eventName =
        type === 'twitter'
          ? EventNames.CREATE_ACCOUNT_COMPLETE_TWITTER
          : EventNames.CREATE_ACCOUNT_COMPLETE_INSTAGRAM

      track(
        make({
          eventName,
          isVerified,
          emailAddress: emailField.value,
          handle
        })
      )
    },
    [twitterInfo, instagramInfo, emailField]
  )

  const setOAuthInfo = useCallback(() => {
    if (twitterInfo) {
      dispatch(
        signOnActions.setTwitterProfile(
          twitterInfo.twitterId,
          twitterInfo.profile,
          twitterInfo.profile.profile_image_url_https
            ? {
                // Replace twitter's returned image (which may vary) with the hd one
                uri: twitterInfo.profile.profile_image_url_https.replace(
                  /_(normal|bigger|mini)/g,
                  ''
                ),
                name: 'ProfileImage',
                type: 'image/jpeg'
              }
            : null,
          twitterInfo.profile.profile_banner_url
            ? {
                uri: twitterInfo.profile.profile_banner_url,
                name: 'ProfileBanner',
                type: 'image/png'
              }
            : null
        )
      )
    } else if (instagramInfo) {
      dispatch(
        signOnActions.setInstagramProfile(
          instagramInfo.instagramId,
          instagramInfo.profile,
          instagramInfo.profile.profile_pic_url_hd
            ? {
                uri: instagramInfo.profile.profile_pic_url_hd,
                name: 'ProfileImage',
                type: 'image/jpeg'
              }
            : null
        )
      )
    }
  }, [dispatch, twitterInfo, instagramInfo])

  const signUp = useCallback(() => {
    dispatch(signOnActions.signUp())
  }, [dispatch])

  useEffect(() => {
    if (!hasNavigatedAway && twitterInfo) {
      if (handleField.status !== EditingStatus.SUCCESS && !didValidateHandle) {
        validateHandle('twitter')
        setDidValidateHandle(true)
      } else if (
        handleField.status === EditingStatus.FAILURE ||
        twitterInfo.requiresUserReview
      ) {
        trackOAuthComplete('twitter')
        setOAuthInfo()
        goTo('ProfileManual')
        setHasNavigatedAway(true)
        setIsLoading(false)
      } else if (handleField.status === EditingStatus.SUCCESS) {
        trackOAuthComplete('twitter')
        setOAuthInfo()
        signUp()
        goTo('FirstFollows')
        setHasNavigatedAway(true)
        setIsLoading(false)
      }
    }
  }, [
    hasNavigatedAway,
    twitterInfo,
    handleField,
    didValidateHandle,
    validateHandle,
    setOAuthInfo,
    signUp,
    goTo,
    trackOAuthComplete
  ])

  useEffect(() => {
    if (twitterError) {
      setIsLoading(false)
    }
  }, [twitterError])

  useEffect(() => {
    if (!hasNavigatedAway && instagramInfo) {
      if (handleField.status !== EditingStatus.SUCCESS && !didValidateHandle) {
        validateHandle('instagram')
        setDidValidateHandle(true)
      } else if (
        handleField.status === EditingStatus.FAILURE ||
        instagramInfo.requiresUserReview
      ) {
        trackOAuthComplete('instagram')
        setOAuthInfo()
        goTo('ProfileManual')
        setHasNavigatedAway(true)
        setIsLoading(false)
      } else if (handleField.status === EditingStatus.SUCCESS) {
        trackOAuthComplete('instagram')
        setOAuthInfo()
        signUp()
        goTo('FirstFollows')
        setHasNavigatedAway(true)
        setIsLoading(false)
      }
    }
  }, [
    hasNavigatedAway,
    instagramInfo,
    handleField,
    didValidateHandle,
    validateHandle,
    signUp,
    setOAuthInfo,
    goTo,
    trackOAuthComplete
  ])

  useEffect(() => {
    if (instagramError) {
      setIsLoading(false)
    }
  }, [instagramError])

  const onTwitterPress = () => {
    setIsLoading(true)
    dispatch(oauthActions.setTwitterError(null))
    dispatch(oauthActions.twitterAuth())
    track(
      make({
        eventName: EventNames.CREATE_ACCOUNT_START_TWITTER,
        emailAddress: emailField.value
      })
    )
  }

  const onInstagramPress = () => {
    setIsLoading(true)
    dispatch(oauthActions.setInstagramError(null))
    dispatch(oauthActions.instagramAuth())
    track(
      make({
        eventName: EventNames.CREATE_ACCOUNT_START_INSTAGRAM,
        emailAddress: emailField.value
      })
    )
  }

  useEffect(() => {
    if (abandoned) {
      setIsLoading(false)
    }
  }, [abandoned])

  return (
    <SafeAreaView style={{ backgroundColor: 'white' }}>
      <SignupHeader />
      <View style={styles.container}>
        {isLoading ? (
          <View style={(styles.containerForm, { flex: 0.75 })}>
            <FormTitle />
            <View style={styles.loadingIcon}>
              <LoadingSpinner fill={neutralLight4} />
            </View>
          </View>
        ) : (
          <View style={styles.containerForm}>
            <FormTitle />

            <View style={styles.tile}>
              <Text variant={'h3'} style={styles.tileHeader}>
                {messages.importTileHeader}
              </Text>
              <View style={[styles.tileListItem]}>
                <View style={styles.tileListItemIconCircle}>
                  <IconUser fill={staticWhite} height={16} width={16} />
                </View>
                <Text variant={'h4'} noGutter style={styles.tileListItemText}>
                  {messages.importTileItemHandle}
                </Text>
              </View>
              <View style={[styles.tileListItem]}>
                <View style={styles.tileListItemIconCircle}>
                  <IconImage fill={staticWhite} height={16} width={16} />
                </View>
                <Text variant={'h4'} noGutter style={styles.tileListItemText}>
                  {messages.importTileItemPicture}
                </Text>
              </View>
            </View>

            <TwitterButton onPress={onTwitterPress} />
            <InstagramButton onPress={onInstagramPress} />

            <View style={styles.tile}>
              <Text variant={'h3'} style={styles.tileHeader}>
                {messages.verifiedTileHeader}
              </Text>
              <View style={[styles.tileListItem]}>
                <IconVerified
                  height={24}
                  width={24}
                  style={styles.verifiedIcon}
                />
                <Text variant={'h4'} noGutter style={styles.tileListItemText}>
                  {messages.verifiedTileContent}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => goTo('ProfileManual')}
            >
              <Text
                fontSize='medium'
                weight='medium'
                style={styles.manualButtonText}
              >
                {messages.manual}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default ProfileAuto
