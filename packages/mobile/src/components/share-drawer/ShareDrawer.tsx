import React, { useCallback, useContext, useRef, useState } from 'react'

import EventEmitter from 'events'
import path from 'path'

import {
  encodeHashId,
  FeatureFlags,
  accountSelectors,
  collectionsSocialActions,
  tracksSocialActions,
  usersSocialActions,
  shareModalUISelectors,
  shareSoundToTiktokModalActions,
  uuid,
  ErrorLevel
} from '@audius/common'
import Clipboard from '@react-native-clipboard/clipboard'
import type { FFmpegSession } from 'ffmpeg-kit-react-native'
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native'
import { Linking, View } from 'react-native'
import Config from 'react-native-config'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'
import ViewShot from 'react-native-view-shot'
import { useDispatch, useSelector } from 'react-redux'

import IconInstagram from 'app/assets/images/iconInstagram.svg'
import IconLink from 'app/assets/images/iconLink.svg'
import IconShare from 'app/assets/images/iconShare.svg'
import IconTikTok from 'app/assets/images/iconTikTok.svg'
import IconTikTokInverted from 'app/assets/images/iconTikTokInverted.svg'
import IconTwitterBird from 'app/assets/images/iconTwitterBird.svg'
import DeprecatedText from 'app/components/text'
import { useFeatureFlag } from 'app/hooks/useRemoteConfig'
import { apiClient } from 'app/services/audius-api-client'
import { makeStyles } from 'app/styles'
import { reportToSentry } from 'app/utils/reportToSentry'
import { Theme, useThemeColors, useThemeVariant } from 'app/utils/theme'

import ActionDrawer from '../action-drawer'
import { ToastContext } from '../toast/ToastContext'

import { ShareToStorySticker } from './ShareToStorySticker'
import { messages } from './messages'
import { getContentUrl, getTwitterShareUrl } from './utils'
const { getShareContent, getShareSource } = shareModalUISelectors
const { requestOpen: requestOpenTikTokModal } = shareSoundToTiktokModalActions
const { shareUser } = usersSocialActions
const { shareTrack } = tracksSocialActions
const { shareCollection } = collectionsSocialActions
const { getAccountUser } = accountSelectors

const useStyles = makeStyles(({ palette }) => ({
  shareToTwitterAction: {
    color: palette.staticTwitterBlue
  },
  shareToTikTokAction: {
    color: 'black'
  },
  shareToTikTokActionDark: {
    color: palette.staticWhite
  },
  copyLinkAction: {
    color: palette.secondary
  },
  shareToInstagramStoryAction: {
    color: palette.primary
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16
  },
  titleText: {
    fontSize: 18
  },
  titleIcon: {
    marginRight: 8
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  viewShot: {
    position: 'absolute',
    // Position the container off-screen (264px is the width of the whole thing)
    right: -264 - 5
  }
}))

const stickerLoadedEventEmitter = new EventEmitter()
const STICKER_LOADED_EVENT = 'loaded' as const

export const ShareDrawer = () => {
  const styles = useStyles()
  const viewShotRef = useRef() as React.RefObject<ViewShot>
  const [shouldRenderShareToStorySticker, setShouldRenderShareToStorySticker] =
    useState(false)

  const { isEnabled: isShareToTikTokEnabled } = useFeatureFlag(
    FeatureFlags.SHARE_SOUND_TO_TIKTOK
  )
  const { isEnabled: isShareToInstagramStoryEnabled } = useFeatureFlag(
    FeatureFlags.SHARE_TO_STORY
  )

  const isStickerImageLoadedRef = useRef(false)
  const handleShareToStoryStickerLoad = () => {
    isStickerImageLoadedRef.current = true
    stickerLoadedEventEmitter.emit(STICKER_LOADED_EVENT)
  }

  const { primary, secondary, neutral, staticTwitterBlue } = useThemeColors()
  const themeVariant = useThemeVariant()
  const isLightMode = themeVariant === Theme.DEFAULT
  const dispatch = useDispatch()
  const content = useSelector(getShareContent)
  const source = useSelector(getShareSource)
  const account = useSelector(getAccountUser)
  const { toast } = useContext(ToastContext)
  const isOwner =
    content?.type === 'track' &&
    account &&
    account.user_id === content.artist.user_id
  const shareType = content?.type ?? 'track'

  const captureStickerImage = useCallback(async () => {
    if (!isStickerImageLoadedRef.current) {
      // Wait for the sticker component and image inside it to load. If this hasn't happened in 5 seconds, assume that it failed.
      await Promise.race([
        new Promise((resolve) =>
          stickerLoadedEventEmitter.once(STICKER_LOADED_EVENT, resolve)
        ),
        new Promise((resolve) => {
          setTimeout(resolve, 5000)
        })
      ])

      if (!isStickerImageLoadedRef.current) {
        // Loading the sticker failed; return undefined
        throw new Error('The sticker component did not load successfully.')
      }
    }

    let res: string | undefined
    if (viewShotRef && viewShotRef.current && viewShotRef.current.capture) {
      res = await viewShotRef.current.capture()
    }
    return res
  }, [])

  const handleShareToTwitter = useCallback(async () => {
    if (!content) return
    const twitterShareUrl = getTwitterShareUrl(content)
    const isSupported = await Linking.canOpenURL(twitterShareUrl)
    if (isSupported) {
      Linking.openURL(twitterShareUrl)
    } else {
      console.error(`Can't open: ${twitterShareUrl}`)
    }
  }, [content])

  const handleShareToTikTok = useCallback(() => {
    if (content?.type === 'track') {
      dispatch(requestOpenTikTokModal({ id: content.track.track_id }))
    }
  }, [content, dispatch])

  const handleShareToInstagramStory = useCallback(async () => {
    if (content?.type === 'track') {
      if (!shouldRenderShareToStorySticker) {
        setShouldRenderShareToStorySticker(true)
      }
      const encodedTrackId = encodeHashId(content.track.track_id)
      const streamMp3Url = apiClient.makeUrl(`/tracks/${encodedTrackId}/stream`)
      const storyVideoPath = path.join(
        RNFS.TemporaryDirectoryPath,
        `storyVideo-${uuid()}.mp4`
      )
      const audioStartOffsetConfig =
        content.track.duration && content.track.duration >= 20 ? '-ss 10 ' : ''
      let session: FFmpegSession
      let stickerUri: string | undefined
      try {
        ;[session, stickerUri] = await Promise.all([
          FFmpegKit.execute(
            `${audioStartOffsetConfig}-i ${streamMp3Url} -filter_complex "gradients=s=1080x1920:c0=000000:c1=434343:x0=0:x1=0:y0=0:y1=1920:duration=10:speed=0.0225:rate=60[bg];[0:a]aformat=channel_layouts=mono,showwaves=mode=cline:n=1:s=1080x200:scale=cbrt:colors=#ffffff[fg];[bg][fg]overlay=format=auto:x=0:y=H-h-100" -pix_fmt yuv420p -vb 50M -t 10 ${storyVideoPath}`
          ),
          captureStickerImage()
        ])
      } catch (e) {
        reportToSentry({
          level: ErrorLevel.Error,
          error: e,
          name: 'Share to IG Story error'
        })
        toast({ content: messages.shareToStoryError, type: 'error' })
        return
      }
      const returnCode = await session.getReturnCode()

      if (!ReturnCode.isSuccess(returnCode)) {
        const output = await session.getOutput()
        reportToSentry({
          level: ErrorLevel.Error,
          output,
          name: 'Share to IG Story error - generate video background step'
        })
        toast({ content: messages.shareToStoryError, type: 'error' })
        return
      }
      if (!stickerUri) {
        reportToSentry({
          level: ErrorLevel.Error,
          name: 'Share to IG Story error - generate sticker step (sticker undefined)'
        })
        toast({ content: messages.shareToStoryError, type: 'error' })
        return
      }
      const shareOptions = {
        backgroundVideo: storyVideoPath,
        stickerImage: stickerUri,
        attributionURL: Config.AUDIUS_URL,
        social: Share.Social.INSTAGRAM_STORIES,
        appId: Config.INSTAGRAM_APP_ID
      }
      try {
        await Share.shareSingle(shareOptions)
      } catch (error) {
        reportToSentry({
          level: ErrorLevel.Error,
          error,
          name: 'Share to IG Story error - share to IG step'
        })
        toast({ content: messages.shareToStoryError, type: 'error' })
      }
    }
  }, [content, captureStickerImage, toast, shouldRenderShareToStorySticker])

  const handleCopyLink = useCallback(() => {
    if (!content) return
    const link = getContentUrl(content)
    Clipboard.setString(link)
    toast({ content: messages.toast(shareType), type: 'info' })
  }, [toast, content, shareType])

  const handleOpenShareSheet = useCallback(() => {
    if (!source || !content) return
    switch (content.type) {
      case 'track':
        dispatch(shareTrack(content.track.track_id, source))
        break
      case 'profile':
        dispatch(shareUser(content.profile.user_id, source))
        break
      case 'album':
        dispatch(shareCollection(content.album.playlist_id, source))
        break
      case 'playlist':
        dispatch(shareCollection(content.playlist.playlist_id, source))
        break
    }
  }, [dispatch, content, source])

  const shouldIncludeTikTokAction = Boolean(
    isShareToTikTokEnabled &&
      content?.type === 'track' &&
      isOwner &&
      !content.track.is_unlisted &&
      !content.track.is_invalid &&
      !content.track.is_delete
  )

  const shouldIncludeInstagramStoryAction = Boolean(
    isShareToInstagramStoryEnabled &&
      content?.type === 'track' &&
      !content.track.is_unlisted &&
      !content.track.is_invalid &&
      !content.track.is_delete
  )

  const getRows = useCallback(() => {
    const shareToTwitterAction = {
      icon: <IconTwitterBird fill={staticTwitterBlue} height={20} width={26} />,
      text: messages.twitter,
      style: styles.shareToTwitterAction,
      callback: handleShareToTwitter
    }

    const TikTokIcon = isLightMode ? IconTikTok : IconTikTokInverted

    const shareToTikTokAction = {
      text: messages.tikTok,
      icon: <TikTokIcon height={26} width={26} />,
      style: isLightMode
        ? styles.shareToTikTokAction
        : styles.shareToTikTokActionDark,
      callback: handleShareToTikTok
    }

    const copyLinkAction = {
      text: messages.copyLink(shareType),
      icon: <IconLink height={26} width={26} fill={secondary} />,
      style: styles.copyLinkAction,
      callback: handleCopyLink
    }

    const shareSheetAction = {
      text: messages.shareSheet(shareType),
      icon: <IconShare height={26} width={26} fill={secondary} />,
      style: styles.copyLinkAction,
      callback: handleOpenShareSheet
    }

    const shareToInstagramStoriesAction = {
      text: messages.instagramStory,
      icon: <IconInstagram fill={primary} height={26} width={26} />,
      style: styles.shareToInstagramStoryAction,
      callback: handleShareToInstagramStory
    }

    const result: {
      text: string
      icon: React.ReactElement
      style: Record<string, string>
      callback: (() => void) | (() => Promise<void>)
    }[] = [shareToTwitterAction]

    if (shouldIncludeTikTokAction) {
      result.push(shareToTikTokAction)
    }
    if (shouldIncludeInstagramStoryAction) {
      result.push(shareToInstagramStoriesAction)
    }

    result.push(copyLinkAction, shareSheetAction)

    return result
  }, [
    staticTwitterBlue,
    styles.shareToTwitterAction,
    styles.shareToTikTokAction,
    styles.shareToTikTokActionDark,
    styles.copyLinkAction,
    styles.shareToInstagramStoryAction,
    handleShareToTwitter,
    isLightMode,
    handleShareToTikTok,
    shareType,
    secondary,
    handleCopyLink,
    handleOpenShareSheet,
    primary,
    handleShareToInstagramStory,
    shouldIncludeTikTokAction,
    shouldIncludeInstagramStoryAction
  ])

  return (
    <>
      {shouldRenderShareToStorySticker ? (
        <ViewShot
          style={styles.viewShot}
          ref={viewShotRef}
          options={{ format: 'png' }}
        >
          <ShareToStorySticker
            onLoad={handleShareToStoryStickerLoad}
            track={content.track}
            // user={account}
            artist={content.artist}
          />
        </ViewShot>
      ) : null}
      <ActionDrawer
        modalName='Share'
        rows={getRows()}
        renderTitle={() => (
          <View style={styles.title}>
            <IconShare
              style={styles.titleIcon}
              fill={neutral}
              height={18}
              width={20}
            />
            <DeprecatedText weight='bold' style={styles.titleText}>
              {messages.modalTitle(shareType)}
            </DeprecatedText>
          </View>
        )}
        styles={{ row: styles.row }}
      />
    </>
  )
}
