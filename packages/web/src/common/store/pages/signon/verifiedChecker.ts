import { Nullable } from '@audius/common'

type TwitterUser = {
  verified: boolean
}

type InstagramUser = {
  is_verified: boolean
}

type TikTokUser = {
  verified: boolean
}

type HandleCheckStatus =
  | 'twitterReserved'
  | 'instagramReserved'
  | 'tiktokReserved'
  | 'notReserved'

export const checkHandle = (
  isOauthVerified: boolean,
  lookedUpTwitterUser: Nullable<TwitterUser>,
  lookedUpInstagramUser: Nullable<InstagramUser>,
  lookedUpTikTokUser: Nullable<TikTokUser>
): HandleCheckStatus => {
  const isEquivalentTwitterHandleVerified =
    lookedUpTwitterUser && lookedUpTwitterUser.verified

  const isEquivalentInstagramHandleVerified =
    lookedUpInstagramUser && lookedUpInstagramUser.is_verified

  const isEquivalentTikTokHandleVerified =
    lookedUpTikTokUser && lookedUpTikTokUser.verified

  if (!isOauthVerified) {
    if (isEquivalentTwitterHandleVerified) {
      return 'twitterReserved'
    }
    if (isEquivalentInstagramHandleVerified) {
      return 'instagramReserved'
    }
    if (isEquivalentTikTokHandleVerified) {
      return 'tiktokReserved'
    }
  }
  return 'notReserved'
}
