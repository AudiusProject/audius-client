import { useCallback } from 'react'

import { accountSelectors } from '@audius/common'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import type { LineupTileProps } from 'app/components/lineup-tile/types'

import { FadeInView } from '../core'

import { LineupTileActionButtons } from './LineupTileActionButtons'
import {
  LineupTileBannerIcon,
  LineupTileBannerIconType
} from './LineupTileBannerIcon'
import { LineupTileCoSign } from './LineupTileCoSign'
import { LineupTileMetadata } from './LineupTileMetadata'
import { LineupTileRoot } from './LineupTileRoot'
import { LineupTileStats } from './LineupTileStats'
import { LineupTileTopRight } from './LineupTileTopRight'
const { getUserId } = accountSelectors

export const LineupTile = ({
  children,
  coSign,
  duration,
  favoriteType,
  hidePlays,
  hideShare,
  id,
  index,
  isTrending,
  isUnlisted,
  onLoad,
  onPress,
  onPressOverflow,
  onPressRepost,
  onPressSave,
  onPressShare,
  onPressTitle,
  playCount,
  renderImage,
  repostType,
  showArtistPick,
  showRankIcon,
  title,
  item,
  uid,
  user,
  isPlayingUid,
  TileProps
}: LineupTileProps) => {
  const {
    has_current_user_reposted,
    has_current_user_saved,
    repost_count,
    save_count
  } = item
  const { _artist_pick, name, user_id } = user
  const currentUserId = useSelector(getUserId)
  const isCollection = 'playlist_id' in item

  const isOwner = user_id === currentUserId

  const handleLoad = useCallback(() => {
    onLoad?.(index)
  }, [onLoad, index])

  return (
    <LineupTileRoot onPress={onPress} {...TileProps}>
      <FadeInView>
        {showArtistPick && _artist_pick === id ? (
          <LineupTileBannerIcon type={LineupTileBannerIconType.STAR} />
        ) : null}
        {isUnlisted ? (
          <LineupTileBannerIcon type={LineupTileBannerIconType.HIDDEN} />
        ) : null}
        <View>
          <LineupTileTopRight
            duration={duration}
            isArtistPick={_artist_pick === id}
            isUnlisted={isUnlisted}
            showArtistPick={showArtistPick}
          />
          <LineupTileMetadata
            artistName={name}
            coSign={coSign}
            renderImage={renderImage}
            onPressTitle={onPressTitle}
            setArtworkLoaded={handleLoad}
            uid={uid}
            title={title}
            user={user}
            isPlayingUid={isPlayingUid}
          />
          {coSign ? <LineupTileCoSign coSign={coSign} /> : null}
          <LineupTileStats
            favoriteType={favoriteType}
            repostType={repostType}
            hidePlays={hidePlays}
            id={id}
            index={index}
            isCollection={isCollection}
            isTrending={isTrending}
            isUnlisted={isUnlisted}
            playCount={playCount}
            repostCount={repost_count}
            saveCount={save_count}
            showRankIcon={showRankIcon}
          />
        </View>
        {children}
        <LineupTileActionButtons
          hasReposted={has_current_user_reposted}
          hasSaved={has_current_user_saved}
          isOwner={isOwner}
          isShareHidden={hideShare}
          isUnlisted={isUnlisted}
          onPressOverflow={onPressOverflow}
          onPressRepost={onPressRepost}
          onPressSave={onPressSave}
          onPressShare={onPressShare}
        />
      </FadeInView>
    </LineupTileRoot>
  )
}
