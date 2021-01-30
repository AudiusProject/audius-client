import React, { useEffect, useContext, ReactNode, useCallback } from 'react'
import cn from 'classnames'
import { ID, UID } from 'models/common/Identifiers'

import { Tabs, ProfileUser } from 'containers/profile-page/store/types'
import { Status } from 'store/types'
import styles from './ProfilePage.module.css'
import { ReactComponent as IconNote } from 'assets/img/iconNote.svg'
import { ReactComponent as IconAlbum } from 'assets/img/iconAlbum.svg'
import { ReactComponent as IconPlaylists } from 'assets/img/iconPlaylists.svg'
import { ReactComponent as IconReposts } from 'assets/img/iconRepost.svg'
import Lineup from 'containers/lineup/Lineup'
import Card from 'components/card/mobile/Card'
import CardLineup from 'containers/lineup/CardLineup'
import { albumPage, playlistPage, fullProfilePage } from 'utils/route'
import useTabs from 'hooks/useTabs/useTabs'

import ProfileHeader from './ProfileHeader'
import User from 'models/User'
import Collection from 'models/Collection'
import { LineupState } from 'models/common/Lineup'

import { CoverPhotoSizes, ProfilePictureSizes } from 'models/common/ImageSizes'
import { tracksActions } from 'containers/profile-page/store/lineups/tracks/actions'
import { feedActions } from 'containers/profile-page/store/lineups/feed/actions'
import NavContext, {
  LeftPreset,
  CenterPreset
} from 'containers/nav/store/context'
import PullToRefresh from 'components/pull-to-refresh/PullToRefresh'
import useAsyncPoll from 'hooks/useAsyncPoll'
import EditProfile from './EditProfile'
import TextElement, { Type } from 'containers/nav/mobile/TextElement'
import NetworkConnectivityMonitor from 'containers/network-connectivity/NetworkConnectivityMonitor'
import MobilePageContainer from 'components/general/MobilePageContainer'
import { OverflowAction } from 'store/application/ui/mobileOverflowModal/types'
import IconButton from 'components/general/IconButton'
import { withNullGuard } from 'utils/withNullGuard'
import { IconKebabHorizontal } from '@audius/stems'
import { HeaderContext } from 'components/general/header/mobile/HeaderContextProvider'

export type ProfilePageProps = {
  // Computed
  accountUserId: ID | null
  isArtist: boolean
  isOwner: boolean
  userId: ID | null
  handle: string
  verified: boolean
  created: string
  name: string
  bio: string
  location: string
  twitterHandle: string
  instagramHandle: string
  twitterVerified?: boolean
  instagramVerified?: boolean
  website: string
  donation: string
  coverPhotoSizes: CoverPhotoSizes | null
  profilePictureSizes: ProfilePictureSizes | null
  hasProfilePicture: boolean
  followers: User[]
  followersLoading: boolean
  setFollowingUserId: (userId: ID) => void
  setFollowersUserId: (userId: ID) => void
  activeTab: Tabs | null
  following: boolean
  isSubscribed: boolean
  mode: string
  // Whether or not the user has edited at least one thing on their profile
  hasMadeEdit: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onClickMobileOverflow: (userId: ID, overflowActions: OverflowAction[]) => void
  stats: Array<{ number: number; title: string; key: string }>
  trackIsActive: boolean

  profile: ProfileUser | null
  albums: Collection[] | null
  playlists: Collection[] | null
  status: Status
  goToRoute: (route: string) => void
  artistTracks: LineupState<{ id: ID }>
  userFeed: LineupState<{ id: ID }>
  playArtistTrack: (uid: UID) => void
  pauseArtistTrack: () => void
  playUserFeedTrack: (uid: UID) => void
  pauseUserFeedTrack: () => void
  refreshProfile: () => void

  // Updates
  updatedCoverPhoto: { file: File; url: string } | null
  updatedProfilePicture: { file: File; url: string } | null

  // Methods
  changeTab: (tab: Tabs) => void
  getLineupProps: (lineup: any) => any
  loadMoreArtistTracks: (offset: number, limit: number) => void
  loadMoreUserFeed: (offset: number, limit: number) => void
  formatCardSecondaryText: (
    saves: number,
    tracks: number,
    isPrivate?: boolean
  ) => string
  fetchFollowers: () => void
  onFollow: (id: ID) => void
  onConfirmUnfollow: (id: ID) => void
  updateName: (name: string) => void
  updateBio: (bio: string) => void
  updateLocation: (location: string) => void
  updateTwitterHandle: (handle: string) => void
  updateInstagramHandle: (handle: string) => void
  updateWebsite: (website: string) => void
  updateDonation: (donation: string) => void
  updateProfilePicture: (
    selectedFiles: any,
    source: 'original' | 'unsplash'
  ) => Promise<void>
  updateCoverPhoto: (
    selectedFiles: any,
    source: 'original' | 'unsplash'
  ) => Promise<void>
  setNotificationSubscription: (userId: ID, isSubscribed: boolean) => void
  didChangeTabsFrom: (prevLabel: string, currentLabel: string) => void
}

type EmptyTabProps = {
  message: ReactNode
}

export const EmptyTab = (props: EmptyTabProps) => {
  return <div className={styles.emptyTab}>{props.message}</div>
}

const getMessages = ({
  name,
  isOwner
}: {
  name: string
  isOwner: boolean
}) => ({
  emptyTracks: isOwner
    ? "You haven't created any tracks yet"
    : `${name} hasn't created any tracks yet`,
  emptyAlbums: isOwner
    ? "You haven't created any albums yet"
    : `${name} hasn't created any albums yet`,
  emptyPlaylists: isOwner
    ? "You haven't created any playlists yet"
    : `${name} hasn't created any playlists yet`,
  emptyReposts: isOwner
    ? "You haven't reposted anything yet"
    : `${name} hasn't reposted anything yet`
})

const g = withNullGuard((props: ProfilePageProps) => {
  const { profile, albums, playlists } = props
  if (profile && albums && playlists) {
    return { ...props, profile, albums, playlists }
  }
})

const ProfilePage = g(
  ({
    userId,
    name,
    handle,
    profile,
    bio,
    location,
    status,
    isArtist,
    isOwner,
    verified,
    coverPhotoSizes,
    profilePictureSizes,
    hasProfilePicture,
    followers,
    twitterHandle,
    instagramHandle,
    twitterVerified,
    instagramVerified,
    website,
    donation,
    albums,
    playlists,
    artistTracks,
    userFeed,
    getLineupProps,
    loadMoreArtistTracks,
    loadMoreUserFeed,
    playArtistTrack,
    pauseArtistTrack,
    playUserFeedTrack,
    pauseUserFeedTrack,
    formatCardSecondaryText,
    setFollowingUserId,
    setFollowersUserId,
    refreshProfile,
    goToRoute,
    following,
    isSubscribed,
    onFollow,
    onConfirmUnfollow,
    mode,
    hasMadeEdit,
    onEdit,
    onSave,
    onCancel,
    updatedCoverPhoto,
    updatedProfilePicture,
    updateName,
    updateBio,
    updateLocation,
    updateTwitterHandle,
    updateInstagramHandle,
    updateWebsite,
    updateDonation,
    updateProfilePicture,
    updateCoverPhoto,
    setNotificationSubscription,
    onClickMobileOverflow,
    didChangeTabsFrom
  }) => {
    const { setHeader } = useContext(HeaderContext)
    useEffect(() => {
      setHeader(null)
    }, [setHeader])

    const messages = getMessages({ name, isOwner })
    let content
    let profileTabs
    let profileElements
    const isLoading = status === Status.LOADING
    const isEditing = mode === 'editing'

    const onClickOverflow = useCallback(() => {
      const overflowActions = [
        !isOwner
          ? following
            ? OverflowAction.UNFOLLOW
            : OverflowAction.FOLLOW
          : null,
        OverflowAction.SHARE
      ].filter(Boolean)

      // @ts-ignore: doesn't respect filter(Boolean)
      onClickMobileOverflow(userId, overflowActions)
    }, [onClickMobileOverflow, following, userId, isOwner])

    // Set Nav-Bar Menu
    const { setLeft, setCenter, setRight } = useContext(NavContext)!
    useEffect(() => {
      let leftNav
      let rightNav
      if (isEditing) {
        leftNav = (
          <TextElement text='Cancel' type={Type.SECONDARY} onClick={onCancel} />
        )
        rightNav = (
          <TextElement
            text='Save'
            type={Type.PRIMARY}
            isEnabled={hasMadeEdit}
            onClick={onSave}
          />
        )
      } else {
        leftNav = isOwner ? LeftPreset.SETTINGS : LeftPreset.BACK
        rightNav = (
          <IconButton
            className={styles.overflowNav}
            icon={<IconKebabHorizontal />}
            onClick={onClickOverflow}
          />
        )
      }
      if (userId) {
        setLeft(leftNav)
        setRight(rightNav)
        setCenter(CenterPreset.LOGO)
      }
    }, [
      setLeft,
      setCenter,
      setRight,
      userId,
      isOwner,
      isEditing,
      onCancel,
      onSave,
      hasMadeEdit,
      onClickOverflow
    ])

    if (isLoading) {
      content = null
    } else if (isEditing) {
      content = (
        <EditProfile
          name={name}
          bio={bio}
          location={location}
          isVerified={verified}
          twitterHandle={twitterHandle}
          instagramHandle={instagramHandle}
          twitterVerified={twitterVerified}
          instagramVerified={instagramVerified}
          website={website}
          donation={donation}
          onUpdateName={updateName}
          onUpdateBio={updateBio}
          onUpdateLocation={updateLocation}
          onUpdateTwitterHandle={updateTwitterHandle}
          onUpdateInstagramHandle={updateInstagramHandle}
          onUpdateWebsite={updateWebsite}
          onUpdateDonation={updateDonation}
        />
      )
    } else {
      const playlistCards = (playlists || []).map(playlist => (
        <Card
          key={playlist.playlist_id}
          id={playlist.playlist_id}
          userId={playlist.playlist_owner_id}
          imageSize={playlist._cover_art_sizes}
          primaryText={playlist.playlist_name}
          secondaryText={formatCardSecondaryText(
            playlist.save_count,
            playlist.playlist_contents.track_ids.length,
            playlist.is_private
          )}
          onClick={() =>
            goToRoute(
              playlistPage(
                profile.handle,
                playlist.playlist_name,
                playlist.playlist_id
              )
            )
          }
        />
      ))

      if (isArtist) {
        const albumCards = (albums || []).map(album => (
          <Card
            key={album.playlist_id}
            id={album.playlist_id}
            userId={album.playlist_owner_id}
            imageSize={album._cover_art_sizes}
            primaryText={album.playlist_name}
            secondaryText={formatCardSecondaryText(
              album.save_count,
              album.playlist_contents.track_ids.length
            )}
            onClick={() =>
              goToRoute(
                albumPage(
                  profile.handle,
                  album.playlist_name,
                  album.playlist_id
                )
              )
            }
          />
        ))

        profileTabs = [
          { icon: <IconNote />, text: 'Tracks', label: Tabs.TRACKS },
          { icon: <IconAlbum />, text: 'Albums', label: Tabs.ALBUMS },
          { icon: <IconPlaylists />, text: 'Playlists', label: Tabs.PLAYLISTS },
          {
            icon: <IconReposts className={styles.iconReposts} />,
            text: 'Reposts',
            label: Tabs.REPOSTS
          }
        ]
        profileElements = [
          <div className={styles.tracksLineupContainer} key='artistTracks'>
            {profile.track_count === 0 ? (
              <EmptyTab
                message={
                  <>
                    {messages.emptyTracks}
                    <i
                      className={cn('emoji', 'face-with-monocle', styles.emoji)}
                    />
                  </>
                }
              />
            ) : (
              <Lineup
                {...getLineupProps(artistTracks)}
                leadingElementId={profile._artist_pick}
                limit={profile.track_count}
                loadMore={loadMoreArtistTracks}
                playTrack={playArtistTrack}
                pauseTrack={pauseArtistTrack}
                actions={tracksActions}
              />
            )}
          </div>,
          <div className={styles.cardLineupContainer} key='artistAlbums'>
            {(albums || []).length === 0 ? (
              <EmptyTab
                message={
                  <>
                    {messages.emptyAlbums}
                    <i
                      className={cn('emoji', 'face-with-monocle', styles.emoji)}
                    />
                  </>
                }
              />
            ) : (
              <CardLineup
                cardsClassName={styles.cardLineup}
                cards={albumCards}
              />
            )}
          </div>,
          <div className={styles.cardLineupContainer} key='artistPlaylists'>
            {(playlists || []).length === 0 ? (
              <EmptyTab
                message={
                  <>
                    {messages.emptyPlaylists}
                    <i
                      className={cn('emoji', 'face-with-monocle', styles.emoji)}
                    />
                  </>
                }
              />
            ) : (
              <CardLineup
                cardsClassName={styles.cardLineup}
                cards={playlistCards}
              />
            )}
          </div>,
          <div className={styles.tracksLineupContainer} key='artistUsers'>
            {profile.repost_count === 0 ? (
              <EmptyTab
                message={
                  <>
                    {messages.emptyReposts}
                    <i
                      className={cn('emoji', 'face-with-monocle', styles.emoji)}
                    />
                  </>
                }
              />
            ) : (
              <Lineup
                {...getLineupProps(userFeed)}
                count={profile.repost_count}
                loadMore={loadMoreUserFeed}
                playTrack={playUserFeedTrack}
                pauseTrack={pauseUserFeedTrack}
                actions={feedActions}
              />
            )}
          </div>
        ]
      } else {
        profileTabs = [
          {
            icon: <IconReposts className={styles.iconReposts} />,
            text: 'Reposts',
            label: Tabs.REPOSTS
          },
          { icon: <IconPlaylists />, text: 'Playlists', label: Tabs.PLAYLISTS }
        ]
        profileElements = [
          <div className={styles.tracksLineupContainer} key='tracks'>
            {profile.repost_count === 0 ? (
              <EmptyTab
                message={
                  <>
                    {messages.emptyReposts}
                    <i
                      className={cn('emoji', 'face-with-monocle', styles.emoji)}
                    />
                  </>
                }
              />
            ) : (
              <Lineup
                {...getLineupProps(userFeed)}
                count={profile.repost_count}
                loadMore={loadMoreUserFeed}
                playTrack={playUserFeedTrack}
                pauseTrack={pauseUserFeedTrack}
                actions={feedActions}
              />
            )}
          </div>,
          <div className={styles.cardLineupContainer} key='playlists'>
            {(playlists || []).length === 0 ? (
              <EmptyTab
                message={
                  <>
                    {messages.emptyPlaylists}
                    <i
                      className={cn('emoji', 'face-with-monocle', styles.emoji)}
                    />
                  </>
                }
              />
            ) : (
              <CardLineup
                cardsClassName={styles.cardLineup}
                cards={playlistCards}
              />
            )}
          </div>
        ]
      }
    }

    const { tabs, body } = useTabs({
      didChangeTabsFrom,
      tabs: isLoading ? [] : profileTabs || [],
      elements: isLoading ? [] : profileElements || []
    })

    if (!isLoading && !isEditing) {
      content = (
        <div className={styles.contentContainer}>
          <div className={styles.tabs}>{tabs}</div>
          {body}
        </div>
      )
    }

    const asyncRefresh = useAsyncPoll({
      call: refreshProfile,
      variable: status,
      value: Status.SUCCESS
    })

    return (
      <NetworkConnectivityMonitor
        pageDidLoad={status !== Status.LOADING}
        onDidRegainConnectivity={asyncRefresh}
      >
        <MobilePageContainer
          title={name && handle ? `${name} (${handle})` : ''}
          description={bio}
          canonicalUrl={fullProfilePage(handle)}
          containerClassName={styles.container}
        >
          <PullToRefresh
            fetchContent={asyncRefresh}
            shouldPad={false}
            overImage
            isDisabled={isEditing}
          >
            <ProfileHeader
              name={name}
              handle={handle}
              isArtist={isArtist}
              bio={bio}
              verified={verified}
              userId={profile.user_id}
              loading={status === Status.LOADING}
              coverPhotoSizes={coverPhotoSizes}
              profilePictureSizes={profilePictureSizes}
              hasProfilePicture={hasProfilePicture}
              playlistCount={profile.playlist_count}
              trackCount={profile.track_count}
              followerCount={profile.follower_count}
              followingCount={profile.followee_count}
              setFollowingUserId={setFollowingUserId}
              setFollowersUserId={setFollowersUserId}
              twitterHandle={twitterHandle}
              instagramHandle={instagramHandle}
              website={website}
              donation={donation}
              followers={followers}
              following={following}
              isSubscribed={isSubscribed}
              onFollow={onFollow}
              onUnfollow={onConfirmUnfollow}
              goToRoute={goToRoute}
              mode={mode}
              switchToEditMode={onEdit}
              updatedProfilePicture={
                updatedProfilePicture ? updatedProfilePicture.url : null
              }
              updatedCoverPhoto={
                updatedCoverPhoto ? updatedCoverPhoto.url : null
              }
              onUpdateProfilePicture={updateProfilePicture}
              onUpdateCoverPhoto={updateCoverPhoto}
              setNotificationSubscription={setNotificationSubscription}
            />
            {content}
          </PullToRefresh>
        </MobilePageContainer>
      </NetworkConnectivityMonitor>
    )
  }
)

export default ProfilePage
