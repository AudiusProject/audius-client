import React, { useCallback, memo } from 'react'
import { ID, UID } from 'models/common/Identifiers'

import Page from 'components/general/Page'
import CoverPhoto from 'components/general/CoverPhoto'
import StatBanner from 'components/general/StatBanner'
import Mask from 'components/general/Mask'
import UploadChip from 'components/upload/UploadChip'
import NavBanner from 'components/general/NavBanner'
import Card from 'components/card/desktop/Card'
import CardLineup from 'containers/lineup/CardLineup'
import EmptyTab from 'containers/profile-page/components/EmptyTab'
import Lineup from 'containers/lineup/Lineup'
import ProfileWrapping from './ProfileWrapping'
import ConnectedProfileCompletionHeroCard from 'containers/profile-progress/ConnectedProfileCompletionHeroCard'

import { Status } from 'store/types'
import User from 'models/User'
import Collection from 'models/Collection'
import { LineupState } from 'models/common/Lineup'
import { ProfileUser, Tabs } from 'containers/profile-page/store/types'
import useTabs from 'hooks/useTabs/useTabs'
import { make, useRecord } from 'store/analytics/actions'
import { Name } from 'services/analytics'

import {
  albumPage,
  playlistPage,
  profilePage,
  fullProfilePage,
  UPLOAD_PAGE,
  UPLOAD_ALBUM_PAGE,
  UPLOAD_PLAYLIST_PAGE
} from 'utils/route'

import styles from './ProfilePage.module.css'
import { ReactComponent as IconNote } from 'assets/img/iconNote.svg'
import { ReactComponent as IconAlbum } from 'assets/img/iconAlbum.svg'
import { ReactComponent as IconPlaylists } from 'assets/img/iconPlaylists.svg'
import { ReactComponent as IconFeed } from 'assets/img/iconFeed.svg'

import { CoverPhotoSizes, ProfilePictureSizes } from 'models/common/ImageSizes'
import { feedActions } from 'containers/profile-page/store/lineups/feed/actions'
import { tracksActions } from 'containers/profile-page/store/lineups/tracks/actions'

export type ProfilePageProps = {
  // State
  editMode: boolean
  shouldMaskContent: boolean

  mostUsedTags: string[]
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
  updatedCoverPhoto: { error: boolean; url: string }
  profilePictureSizes: ProfilePictureSizes | null
  updatedProfilePicture: { error: boolean; url: string }
  hasProfilePicture: boolean
  followers: User[]
  followersLoading: boolean
  followees: User[]
  followeesLoading: boolean
  followeeFollows: User[]
  activeTab: Tabs | null
  followeeFollowsCount: number
  followeeFollowsLoading: boolean
  dropdownDisabled: boolean
  following: boolean
  isSubscribed: boolean
  mode: string
  stats: Array<{ number: number; title: string; key: string }>

  profile: ProfileUser | null
  albums: Collection[] | null
  playlists: Collection[] | null
  status: Status
  goToRoute: (route: string) => void
  artistTracks: LineupState<{ id: ID }>
  playArtistTrack: (uid: UID) => void
  pauseArtistTrack: () => void
  // Feed
  userFeed: LineupState<{ id: ID }>
  playUserFeedTrack: (uid: UID) => void
  pauseUserFeedTrack: () => void

  // Methods
  onFollow: () => void
  onUnfollow: () => void
  updateName: (name: string) => void
  updateBio: (bio: string) => void
  updateLocation: (location: string) => void
  updateTwitterHandle: (handle: string) => void
  updateInstagramHandle: (handle: string) => void
  updateWebsite: (website: string) => void
  updateDonation: (donation: string) => void
  changeTab: (tab: Tabs) => void
  getLineupProps: (lineup: any) => any
  onEdit: () => void
  onSave: () => void
  onShare: () => void
  onCancel: () => void
  onSortByRecent: () => void
  onSortByPopular: () => void
  loadMoreArtistTracks: (offset: number, limit: number) => void
  loadMoreUserFeed: (offset: number, limit: number) => void
  formatCardSecondaryText: (
    saves: number,
    tracks: number,
    isPrivate?: boolean
  ) => string
  fetchFollowers: () => void
  fetchFollowees: () => void
  fetchFolloweeFollows: () => void
  openCreatePlaylistModal: () => void
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

const ProfilePage = ({
  isOwner,
  profile,
  albums,
  playlists,
  status,
  goToRoute,
  // Tracks
  artistTracks,
  playArtistTrack,
  pauseArtistTrack,
  getLineupProps,
  // Feed
  userFeed,
  playUserFeedTrack,
  pauseUserFeedTrack,
  formatCardSecondaryText,
  loadMoreUserFeed,
  loadMoreArtistTracks,
  openCreatePlaylistModal,

  mostUsedTags,
  onFollow,
  onUnfollow,
  updateName,
  updateBio,
  updateLocation,
  updateTwitterHandle,
  updateInstagramHandle,
  updateWebsite,
  updateDonation,
  updateProfilePicture,
  updateCoverPhoto,
  changeTab,
  mode,
  stats,
  onEdit,
  onSave,
  onShare,
  onCancel,
  onSortByRecent,
  onSortByPopular,
  fetchFollowers,
  fetchFollowees,
  fetchFolloweeFollows,
  isArtist,
  status: profileLoadingStatus,
  activeTab,
  shouldMaskContent,
  editMode,

  accountUserId,
  userId,
  handle,
  verified,
  created,
  name,
  bio,
  location,
  twitterHandle,
  instagramHandle,
  twitterVerified,
  instagramVerified,
  website,
  donation,
  coverPhotoSizes,
  updatedCoverPhoto,
  profilePictureSizes,
  updatedProfilePicture,
  hasProfilePicture,
  followers,
  followersLoading,
  followees,
  followeesLoading,
  followeeFollows,
  followeeFollowsCount,
  followeeFollowsLoading,
  dropdownDisabled,
  following,
  isSubscribed,
  setNotificationSubscription,
  didChangeTabsFrom
}: ProfilePageProps) => {
  const renderProfileCompletionCard = () => {
    return isOwner ? <ConnectedProfileCompletionHeroCard /> : null
  }
  const record = useRecord()
  const onClickUploadAlbum = useCallback(() => {
    goToRoute(UPLOAD_ALBUM_PAGE)
    record(make(Name.TRACK_UPLOAD_OPEN, { source: 'profile' }))
  }, [goToRoute, record])
  const onClickUploadPlaylist = useCallback(() => {
    goToRoute(UPLOAD_PLAYLIST_PAGE)
    record(make(Name.TRACK_UPLOAD_OPEN, { source: 'profile' }))
  }, [goToRoute, record])
  const onClickUploadTrack = useCallback(() => {
    goToRoute(UPLOAD_PAGE)
    record(make(Name.TRACK_UPLOAD_OPEN, { source: 'profile' }))
  }, [goToRoute, record])

  const getArtistProfileContent = () => {
    if (!profile || !albums || !playlists) return { headers: [], elements: [] }
    const albumCards = albums.map((album, index) => (
      <Card
        key={index}
        size='medium'
        handle={profile.handle}
        playlistName={album.playlist_name}
        playlistId={album.playlist_id}
        id={album.playlist_id}
        userId={album.playlist_owner_id}
        isPublic={!album.is_private}
        imageSize={album._cover_art_sizes}
        isPlaylist={!album.is_album}
        primaryText={album.playlist_name}
        // link={fullAlbumPage(profile.handle, album.playlist_name, album.playlist_id)}
        secondaryText={formatCardSecondaryText(
          album.save_count,
          album.playlist_contents.track_ids.length
        )}
        cardCoverImageSizes={album._cover_art_sizes}
        isReposted={album.has_current_user_reposted}
        isSaved={album.has_current_user_saved}
        onClick={() =>
          goToRoute(
            albumPage(profile.handle, album.playlist_name, album.playlist_id)
          )
        }
      />
    ))
    if (isOwner) {
      albumCards.unshift(
        <UploadChip
          key='upload-chip'
          type='album'
          variant='card'
          onClick={onClickUploadAlbum}
          isFirst={albumCards.length === 0}
        />
      )
    }

    const playlistCards = playlists.map((playlist, index) => (
      <Card
        key={index}
        size='medium'
        handle={profile.handle}
        playlistName={playlist.playlist_name}
        playlistId={playlist.playlist_id}
        id={playlist.playlist_id}
        userId={playlist.playlist_owner_id}
        imageSize={playlist._cover_art_sizes}
        isPublic={!playlist.is_private}
        // isAlbum={playlist.is_album}
        primaryText={playlist.playlist_name}
        // link={fullPlaylistPage(profile.handle, playlist.playlist_name, playlist.playlist_id)}
        secondaryText={formatCardSecondaryText(
          playlist.save_count,
          playlist.playlist_contents.track_ids.length,
          playlist.is_private
        )}
        cardCoverImageSizes={playlist._cover_art_sizes}
        isReposted={playlist.has_current_user_reposted}
        isSaved={playlist.has_current_user_saved}
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
    if (isOwner) {
      playlistCards.unshift(
        <UploadChip
          key='upload-chip'
          type='playlist'
          variant='card'
          onClick={onClickUploadPlaylist}
          isArtist
          isFirst={playlistCards.length === 0}
        />
      )
    }

    const trackUploadChip = isOwner ? (
      <UploadChip
        key='upload-chip'
        type='track'
        variant='tile'
        onClick={onClickUploadTrack}
      />
    ) : null

    return {
      headers: [
        { icon: <IconNote />, text: Tabs.TRACKS, label: Tabs.TRACKS },
        { icon: <IconAlbum />, text: Tabs.ALBUMS, label: Tabs.ALBUMS },
        {
          icon: <IconPlaylists />,
          text: Tabs.PLAYLISTS,
          label: Tabs.PLAYLISTS
        },
        { icon: <IconFeed />, text: Tabs.REPOSTS, label: Tabs.REPOSTS }
      ],
      elements: [
        <div key={Tabs.TRACKS} className={styles.tiles}>
          {renderProfileCompletionCard()}
          {status !== Status.LOADING ? (
            artistTracks.status !== Status.LOADING &&
            artistTracks.entries.length === 0 ? (
              <EmptyTab
                isOwner={isOwner}
                name={profile.name}
                text={'uploaded any tracks'}
              />
            ) : (
              <Lineup
                {...getLineupProps(artistTracks)}
                count={profile.track_count}
                extraPrecedingElement={trackUploadChip}
                animateLeadingElement
                leadingElementId={profile._artist_pick}
                loadMore={loadMoreArtistTracks}
                playTrack={playArtistTrack}
                pauseTrack={pauseArtistTrack}
                actions={tracksActions}
              />
            )
          ) : null}
        </div>,
        <div key={Tabs.ALBUMS} className={styles.cards}>
          {albums.length === 0 && !isOwner ? (
            <EmptyTab
              isOwner={isOwner}
              name={profile.name}
              text={'created any albums'}
            />
          ) : (
            <CardLineup cardsClassName={styles.cardLineup} cards={albumCards} />
          )}
        </div>,
        <div key={Tabs.PLAYLISTS} className={styles.cards}>
          {playlists.length === 0 && !isOwner ? (
            <EmptyTab
              isOwner={isOwner}
              name={profile.name}
              text={'created any playlists'}
            />
          ) : (
            <CardLineup
              cardsClassName={styles.cardLineup}
              cards={playlistCards}
            />
          )}
        </div>,
        <div key={Tabs.REPOSTS} className={styles.tiles}>
          {status !== Status.LOADING ? (
            (userFeed.status !== Status.LOADING &&
              userFeed.entries.length === 0) ||
            profile.repost_count === 0 ? (
              <EmptyTab
                isOwner={isOwner}
                name={profile.name}
                text={'reposted anything'}
              />
            ) : (
              <Lineup
                {...getLineupProps(userFeed)}
                loadMore={loadMoreUserFeed}
                playTrack={playUserFeedTrack}
                pauseTrack={pauseUserFeedTrack}
                actions={feedActions}
              />
            )
          ) : null}
        </div>
      ]
    }
  }

  const toggleNotificationSubscription = () => {
    if (!userId) return
    setNotificationSubscription(userId, !isSubscribed)
  }

  const getUserProfileContent = () => {
    if (!profile || !playlists) return { headers: [], elements: [] }
    const playlistCards = playlists.map((playlist, index) => (
      <Card
        key={index}
        size='medium'
        id={playlist.playlist_id}
        userId={playlist.playlist_owner_id}
        imageSize={playlist._cover_art_sizes}
        handle={profile.handle}
        playlistId={playlist.playlist_id}
        isPublic={!playlist.is_private}
        playlistName={playlist.playlist_name}
        // isAlbum={playlist.is_album}
        primaryText={playlist.playlist_name}
        secondaryText={formatCardSecondaryText(
          playlist.save_count,
          playlist.playlist_contents.track_ids.length,
          playlist.is_private
        )}
        // link={fullPlaylistPage(profile.handle, playlist.playlist_name, playlist.playlist_id)}
        isReposted={playlist.has_current_user_reposted}
        isSaved={playlist.has_current_user_saved}
        cardCoverImageSizes={playlist._cover_art_sizes}
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
    playlistCards.unshift(
      <UploadChip
        type='playlist'
        variant='card'
        onClick={openCreatePlaylistModal}
        isFirst={playlistCards.length === 0}
      />
    )

    return {
      headers: [
        { icon: <IconFeed />, text: Tabs.REPOSTS, label: Tabs.REPOSTS },
        { icon: <IconPlaylists />, text: Tabs.PLAYLISTS, label: Tabs.PLAYLISTS }
      ],
      elements: [
        <div key={Tabs.REPOSTS} className={styles.tiles}>
          {renderProfileCompletionCard()}
          {(userFeed.status !== Status.LOADING &&
            userFeed.entries.length === 0) ||
          profile.repost_count === 0 ? (
            <EmptyTab
              isOwner={isOwner}
              name={profile.name}
              text={'reposted anything'}
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
        <div key={Tabs.PLAYLISTS} className={styles.cards}>
          {playlists.length === 0 && !isOwner ? (
            <EmptyTab
              isOwner={isOwner}
              name={profile.name}
              text={'created any playlists'}
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

  const { headers, elements } = profile
    ? isArtist
      ? getArtistProfileContent()
      : getUserProfileContent()
    : { headers: [], elements: [] }

  const { tabs, body } = useTabs({
    didChangeTabsFrom,
    isMobile: false,
    tabs: headers,
    bodyClassName: styles.tabBody,
    elements
  })

  return (
    <Page
      title={name && handle ? `${name} (${handle})` : ''}
      description={bio}
      canonicalUrl={fullProfilePage(handle)}
      variant='flush'
      contentClassName={styles.profilePageWrapper}
      scrollableSearch
    >
      <div className={styles.headerWrapper}>
        <ProfileWrapping
          userId={userId}
          loading={status === Status.LOADING}
          verified={verified}
          profilePictureSizes={profilePictureSizes}
          updatedProfilePicture={updatedProfilePicture}
          hasProfilePicture={hasProfilePicture}
          followeeFollows={followeeFollows}
          followeeFollowsCount={followeeFollowsCount}
          followeeFollowsLoading={followeeFollowsLoading}
          loadMoreFolloweeFollows={fetchFolloweeFollows}
          isOwner={isOwner}
          isArtist={isArtist}
          editMode={editMode}
          name={name}
          handle={handle}
          bio={bio}
          location={location}
          twitterHandle={twitterHandle}
          instagramHandle={instagramHandle}
          twitterVerified={twitterVerified}
          instagramVerified={instagramVerified}
          website={website}
          donation={donation}
          created={created}
          tags={mostUsedTags || []}
          onUpdateName={updateName}
          onUpdateProfilePicture={updateProfilePicture}
          onUpdateBio={updateBio}
          onUpdateLocation={updateLocation}
          onUpdateTwitterHandle={updateTwitterHandle}
          onUpdateInstagramHandle={updateInstagramHandle}
          onUpdateWebsite={updateWebsite}
          onUpdateDonation={updateDonation}
          goToRoute={goToRoute}
        />
        <CoverPhoto
          userId={userId}
          coverPhotoSizes={coverPhotoSizes}
          updatedCoverPhoto={updatedCoverPhoto ? updatedCoverPhoto.url : ''}
          error={updatedCoverPhoto ? updatedCoverPhoto.error : false}
          loading={profileLoadingStatus === Status.LOADING}
          onDrop={updateCoverPhoto}
          edit={editMode}
          darken={editMode}
        />
        <Mask show={editMode} zIndex={2}>
          <StatBanner
            empty={!profile}
            mode={mode}
            stats={stats}
            userId={accountUserId}
            handle={handle}
            onClickArtistName={(handle: string) =>
              goToRoute(profilePage(handle))
            }
            onEdit={onEdit}
            onSave={onSave}
            onShare={onShare}
            onCancel={onCancel}
            following={following}
            followers={followers}
            followees={followees}
            followersLoading={followersLoading}
            followeesLoading={followeesLoading}
            loadMoreFollowers={fetchFollowers}
            loadMoreFollowees={fetchFollowees}
            isSubscribed={isSubscribed}
            onToggleSubscribe={toggleNotificationSubscription}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
          />
          <div className={styles.inset}>
            <NavBanner
              empty={!profile}
              tabs={tabs}
              dropdownDisabled={dropdownDisabled}
              onChange={changeTab}
              activeTab={activeTab}
              onSortByRecent={onSortByRecent}
              onSortByPopular={onSortByPopular}
              shouldMaskContent={shouldMaskContent}
            />
            <div className={styles.content}>{body}</div>
          </div>
        </Mask>
      </div>
    </Page>
  )
}

export default memo(ProfilePage)
