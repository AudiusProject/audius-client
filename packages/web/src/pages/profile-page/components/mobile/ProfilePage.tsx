import { useEffect, useContext, ReactNode } from 'react'

import {
  ID,
  UID,
  Collection,
  CoverPhotoSizes,
  ProfilePictureSizes,
  LineupState,
  Status,
  User
} from '@audius/common'
import cn from 'classnames'

import { ReactComponent as IconAlbum } from 'assets/img/iconAlbum.svg'
import { ReactComponent as IconCollectibles } from 'assets/img/iconCollectibles.svg'
import { ReactComponent as IconNote } from 'assets/img/iconNote.svg'
import { ReactComponent as IconPlaylists } from 'assets/img/iconPlaylists.svg'
import { ReactComponent as IconReposts } from 'assets/img/iconRepost.svg'
import { useSelectTierInfo } from 'common/hooks/wallet'
import { feedActions } from 'common/store/pages/profile/lineups/feed/actions'
import { tracksActions } from 'common/store/pages/profile/lineups/tracks/actions'
import { Tabs, ProfileUser } from 'common/store/pages/profile/types'
import { badgeTiers } from 'common/store/wallet/utils'
import Card from 'components/card/mobile/Card'
import CollectiblesPage from 'components/collectibles/components/CollectiblesPage'
import { HeaderContext } from 'components/header/mobile/HeaderContextProvider'
import CardLineup from 'components/lineup/CardLineup'
import Lineup from 'components/lineup/Lineup'
import MobilePageContainer from 'components/mobile-page-container/MobilePageContainer'
import TextElement, { Type } from 'components/nav/mobile/TextElement'
import NavContext, {
  LeftPreset,
  CenterPreset
} from 'components/nav/store/context'
import NetworkConnectivityMonitor from 'components/network-connectivity/NetworkConnectivityMonitor'
import PullToRefresh from 'components/pull-to-refresh/PullToRefresh'
import TierExplainerDrawer from 'components/user-badges/TierExplainerDrawer'
import useAsyncPoll from 'hooks/useAsyncPoll'
import useTabs from 'hooks/useTabs/useTabs'
import { MIN_COLLECTIBLES_TIER } from 'pages/profile-page/ProfilePageProvider'
import { albumPage, playlistPage, fullProfilePage } from 'utils/route'
import { withNullGuard } from 'utils/withNullGuard'

import { DeactivatedProfileTombstone } from '../DeactivatedProfileTombstone'

import EditProfile from './EditProfile'
import ProfileHeader from './ProfileHeader'
import styles from './ProfilePage.module.css'
import { ShareUserButton } from './ShareUserButton'

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
  tikTokHandle: string
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
  stats: Array<{ number: number; title: string; key: string }>
  trackIsActive: boolean
  isUserConfirming: boolean

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
  updateTikTokHandle: (handle: string) => void
  updateWebsite: (website: string) => void
  updateDonation: (donation: string) => void
  updateProfilePicture: (
    selectedFiles: any,
    source: 'original' | 'unsplash' | 'url'
  ) => Promise<void>
  updateCoverPhoto: (
    selectedFiles: any,
    source: 'original' | 'unsplash' | 'url'
  ) => Promise<void>
  setNotificationSubscription: (userId: ID, isSubscribed: boolean) => void
  didChangeTabsFrom: (prevLabel: string, currentLabel: string) => void
  areArtistRecommendationsVisible: boolean
  onCloseArtistRecommendations: () => void
}

type EmptyTabProps = {
  message: ReactNode
}

export const EmptyTab = (props: EmptyTabProps) => {
  return <div className={styles.emptyTab}>{props.message}</div>
}

const artistTabs = [
  { icon: <IconNote />, text: 'Tracks', label: Tabs.TRACKS },
  { icon: <IconAlbum />, text: 'Albums', label: Tabs.ALBUMS },
  { icon: <IconPlaylists />, text: 'Playlists', label: Tabs.PLAYLISTS },
  {
    icon: <IconReposts className={styles.iconReposts} />,
    text: 'Reposts',
    label: Tabs.REPOSTS
  }
]

const userTabs = [
  {
    icon: <IconReposts className={styles.iconReposts} />,
    text: 'Reposts',
    label: Tabs.REPOSTS
  },
  { icon: <IconPlaylists />, text: 'Playlists', label: Tabs.PLAYLISTS }
]

const collectiblesTab = {
  icon: <IconCollectibles />,
  text: 'Collectibles',
  label: Tabs.COLLECTIBLES
}

const artistTabsWithCollectibles = [...artistTabs, collectiblesTab]
const userTabsWithCollectibles = [...userTabs, collectiblesTab]

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
    accountUserId,
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
    tikTokHandle,
    twitterVerified,
    instagramVerified,
    website,
    donation,
    albums,
    playlists,
    artistTracks,
    userFeed,
    isUserConfirming,
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
    updateTikTokHandle,
    updateWebsite,
    updateDonation,
    updateProfilePicture,
    updateCoverPhoto,
    setNotificationSubscription,
    didChangeTabsFrom,
    activeTab,
    areArtistRecommendationsVisible,
    onCloseArtistRecommendations
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
        rightNav = <ShareUserButton userId={userId} />
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
      hasMadeEdit
    ])

    const { tierNumber } = useSelectTierInfo(userId ?? 0)
    const profileHasCollectiblesTierRequirement =
      tierNumber >=
      badgeTiers.findIndex((t) => t.tier === MIN_COLLECTIBLES_TIER)

    const profileHasCollectibles =
      profile?.collectibleList?.length || profile?.solanaCollectibleList?.length
    const profileNeverSetCollectiblesOrder = !profile?.collectibles
    const profileHasNonEmptyCollectiblesOrder =
      profile?.collectibles?.order?.length ?? false
    const profileHasVisibleImageOrVideoCollectibles =
      profileHasCollectibles &&
      (profileNeverSetCollectiblesOrder || profileHasNonEmptyCollectiblesOrder)
    const didCollectiblesLoadAndWasEmpty =
      profileHasCollectibles && !profileHasNonEmptyCollectiblesOrder

    const isUserOnTheirProfile = accountUserId === userId

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
          tikTokHandle={tikTokHandle}
          twitterVerified={twitterVerified}
          instagramVerified={instagramVerified}
          website={website}
          donation={donation}
          onUpdateName={updateName}
          onUpdateBio={updateBio}
          onUpdateLocation={updateLocation}
          onUpdateTwitterHandle={updateTwitterHandle}
          onUpdateInstagramHandle={updateInstagramHandle}
          onUpdateTikTokHandle={updateTikTokHandle}
          onUpdateWebsite={updateWebsite}
          onUpdateDonation={updateDonation}
        />
      )
    } else {
      const playlistCards = (playlists || []).map((playlist) => (
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
        const albumCards = (albums || []).map((album) => (
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

        profileTabs = artistTabs
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
        profileTabs = userTabs
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

      if (
        // `has_collectibles` is a shortcut that is only true iff the user has a modified collectibles state
        (profile?.has_collectibles &&
          profileHasCollectiblesTierRequirement &&
          !didCollectiblesLoadAndWasEmpty) ||
        (profileHasCollectiblesTierRequirement &&
          (profileHasVisibleImageOrVideoCollectibles ||
            (profileHasCollectibles && isUserOnTheirProfile)))
      ) {
        profileTabs = isArtist
          ? artistTabsWithCollectibles
          : userTabsWithCollectibles
        profileElements.push(
          <div key='collectibles' className={styles.tracksLineupContainer}>
            <CollectiblesPage
              userId={userId}
              name={name}
              isMobile={true}
              isUserOnTheirProfile={isUserOnTheirProfile}
              updateProfilePicture={updateProfilePicture}
              profile={profile}
              onSave={onSave}
            />
          </div>
        )
      }
    }

    const { tabs, body } = useTabs({
      didChangeTabsFrom,
      tabs: isLoading ? [] : profileTabs || [],
      elements: isLoading ? [] : profileElements || [],
      initialTab: activeTab || undefined
    })

    if (profile && profile.is_deactivated) {
      content = (
        <div className={styles.contentContainer}>
          <DeactivatedProfileTombstone goToRoute={goToRoute} isMobile={true} />
        </div>
      )
    } else if (!isLoading && !isEditing) {
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
      <>
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
              isDisabled={isEditing || isUserConfirming}
            >
              <ProfileHeader
                isDeactivated={profile?.is_deactivated}
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
                doesFollowCurrentUser={!!profile.does_follow_current_user}
                setFollowingUserId={setFollowingUserId}
                setFollowersUserId={setFollowersUserId}
                twitterHandle={twitterHandle}
                instagramHandle={instagramHandle}
                tikTokHandle={tikTokHandle}
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
                areArtistRecommendationsVisible={
                  areArtistRecommendationsVisible
                }
                onCloseArtistRecommendations={onCloseArtistRecommendations}
              />
              {content}
            </PullToRefresh>
          </MobilePageContainer>
        </NetworkConnectivityMonitor>
        <TierExplainerDrawer />
      </>
    )
  }
)

export default ProfilePage
