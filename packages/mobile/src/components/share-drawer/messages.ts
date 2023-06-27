import type { ShareType } from '@audius/common'

const shareTypeMap: Record<ShareType, string> = {
  track: 'Track',
  profile: 'Profile',
  album: 'Album',
  playlist: 'Playlist',
  audioNftPlaylist: 'Audio NFT Playlist'
}

export const messages = {
  modalTitle: (asset: ShareType) => `Share ${shareTypeMap[asset]}`,
  privatePlaylistShareHelperText:
    'Spread the word! Share your playlist with friends and fans! Private playlists will be visible to anyone on the internet with the link.',
  twitter: 'Share to Twitter',
  instagramStory: 'Share to Instagram Story',
  snapchat: 'Share to Snapchat',
  tikTokVideo: 'Share to TikTok',
  tikTokSound: 'Share Sound to TikTok',
  copyLink: (asset: ShareType) => `Copy Link to ${shareTypeMap[asset]}`,
  shareToStoryError: 'Sorry, something went wrong.',
  shareSheet: (asset: ShareType) => `Share ${asset} via...`,
  toast: (asset: ShareType) => `Copied Link to ${shareTypeMap[asset]}`,
  trackShareText: (title: string, handle: string) =>
    `Check out ${title} by ${handle} on @AudiusProject #Audius`,
  profileShareText: (handle: string) =>
    `Check out ${handle} on @AudiusProject #Audius`,
  albumShareText: (albumName: string, handle: string) =>
    `Check out ${albumName} by ${handle} @AudiusProject #Audius`,
  playlistShareText: (playlistName: string, handle: string) =>
    `Check out ${playlistName} by ${handle} @AudiusProject #Audius`,
  loadingStoryModalTitle: 'Generating Story',
  loadingInstagramStorySubtitle: 'Preparing to open Instagram',
  loadingSnapchatSubtitle: 'Preparing to open Snapchat',
  loadingTikTokSubtitle: 'Preparing to open TikTok',
  cancel: 'Cancel',
  nftPlaylistShareText: '',
  addToPhotoLibraryDenied:
    'You must allow Audius to add to your photo library in order to share to TikTok.',
  addToPhotoLibraryBlocked:
    'Audius is blocked from adding to your photo library. Please give Audius access to Photos in your Security & Privacy settings in order to use Share to TikTok.'
}
