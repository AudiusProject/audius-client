import { ShareType } from 'common/store/ui/share-modal/types'

const shareTypeMap: Record<ShareType, string> = {
  track: 'Track',
  profile: 'Profile',
  album: 'Album'
}

export const messages = {
  modalTitle: (asset: ShareType) => `Share ${shareTypeMap[asset]}`,
  twitter: 'Share to Twitter',
  tikTok: 'Share Sound to TikTok',
  copyLink: (asset: ShareType) => `Copy Link to ${shareTypeMap[asset]}`,
  toast: (asset: ShareType) => `Copied Link to ${shareTypeMap[asset]}`
}
