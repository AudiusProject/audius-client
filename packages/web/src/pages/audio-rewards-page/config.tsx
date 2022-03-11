import React, { ReactNode } from 'react'

import { IconArrow, IconCheck, IconUpload } from '@audius/stems'

import {
  amounts,
  ChallengeRewardID,
  OptimisticUserChallenge,
  TrendingRewardID
} from 'common/models/AudioRewards'
import { formatNumberCommas } from 'common/utils/formatUtil'
import { Nullable } from 'common/utils/typeUtils'
import {
  profilePage,
  SETTINGS_PAGE,
  TRENDING_PAGE,
  UPLOAD_PAGE
} from 'utils/route'

type LinkButtonType =
  | 'trackUpload'
  | 'profile'
  | 'verifyAccount'
  | 'trendingTracks'
type LinkButtonInfo = {
  label: string
  leftIcon: ReactNode | null
  rightIcon: ReactNode | null
  link: (handle: string | null) => string | null
}

const linkButtonMap: Record<LinkButtonType, LinkButtonInfo> = {
  trackUpload: {
    label: 'Upload Tracks',
    leftIcon: null,
    rightIcon: <IconUpload />,
    link: () => UPLOAD_PAGE
  },
  profile: {
    label: 'Your Profile',
    leftIcon: null,
    rightIcon: <IconArrow />,
    link: (handle: Nullable<string>) => (handle ? profilePage(handle) : null)
  },
  verifyAccount: {
    label: 'Verify Your Account',
    leftIcon: null,
    rightIcon: <IconCheck />,
    link: () => SETTINGS_PAGE
  },
  trendingTracks: {
    label: 'Trending Tracks',
    leftIcon: null,
    rightIcon: <IconArrow />,
    link: () => TRENDING_PAGE
  }
}

type ChallengeRewardsInfo = {
  id: ChallengeRewardID
  title: string
  icon: ReactNode
  description: (amount: OptimisticUserChallenge | undefined) => string
  fullDescription: (amount: OptimisticUserChallenge | undefined) => string
  progressLabel: string
  remainingLabel?: string
  amount: number
  panelButtonText: string
  modalButtonInfo: {
    incomplete: LinkButtonInfo | null
    inProgress: LinkButtonInfo | null
    complete: LinkButtonInfo | null
  }
  verifiedChallenge?: boolean
}

export const challengeRewardsConfig: Record<
  ChallengeRewardID,
  ChallengeRewardsInfo
> = {
  referrals: {
    id: 'referrals' as ChallengeRewardID,
    title: 'Invite your Friends',
    icon: <i className='emoji large incoming-envelope' />,
    description: challenge =>
      `Earn ${challenge?.amount} $AUDIO, for you and your friend`,
    fullDescription: challenge =>
      `Invite your Friends! You’ll earn ${challenge?.amount} $AUDIO for each friend who joins with your link (and they’ll get an $AUDIO too)`,
    progressLabel: '%0/%1 Invites Accepted',
    remainingLabel: '%0/%1 Invites Remain',
    amount: amounts.referrals,
    panelButtonText: 'Invite your Friends',
    modalButtonInfo: {
      incomplete: null,
      inProgress: null,
      complete: null
    }
  },
  'ref-v': {
    id: 'ref-v' as ChallengeRewardID,
    title: 'Invite your Fans',
    icon: <i className='emoji large incoming-envelope' />,
    description: challenge =>
      `Earn up to ${formatNumberCommas(challenge?.totalAmount ?? '')} $AUDIO`,
    fullDescription: challenge =>
      `Invite your fans! You’ll earn ${challenge?.amount} $AUDIO for each fan who joins with your link (and they’ll get an $AUDIO too)`,
    progressLabel: '%0/%1 Invites Accepted',
    remainingLabel: '%0/%1 Invites Remain',
    amount: amounts.referrals,
    panelButtonText: 'Invite your Fans',
    modalButtonInfo: {
      incomplete: null,
      inProgress: null,
      complete: null
    },
    verifiedChallenge: true
  },
  referred: {
    id: 'referred',
    title: 'You Accepted An Invite',
    icon: <i className='emoji large love-letter' />,
    description: () => `You earned $AUDIO for being invited`,
    fullDescription: () => `You earned $AUDIO for being invited`,
    progressLabel: '%0/%1 Invites',
    amount: amounts.referrals,
    panelButtonText: 'More Info',
    modalButtonInfo: {
      incomplete: null,
      inProgress: null,
      complete: null
    }
  },
  'connect-verified': {
    id: 'connect-verified' as ChallengeRewardID,
    title: 'Link Verified Accounts',
    icon: <i className='emoji large white-heavy-check-mark' />,
    description: challenge =>
      `Link your verified social media accounts to earn ${challenge?.amount} $AUDIO`,
    fullDescription: () =>
      'Get verified on Audius by linking your verified Twitter or Instagram account!',
    progressLabel: 'Not Linked',
    amount: amounts['connect-verified'],
    panelButtonText: 'Link Verified Account',
    modalButtonInfo: {
      incomplete: linkButtonMap.verifyAccount,
      inProgress: linkButtonMap.verifyAccount,
      complete: linkButtonMap.profile
    }
  },
  'listen-streak': {
    id: 'listen-streak' as ChallengeRewardID,
    title: 'Listening Streak: 7 Days',
    icon: <i className='emoji large headphone' />,
    description: challenge =>
      `Listen to one track a day for seven days to earn ${challenge?.amount} $AUDIO`,
    fullDescription: () =>
      'Sign in and listen to at least one track every day for 7 days',
    progressLabel: '%0/%1 Days',
    amount: amounts['listen-streak'],
    panelButtonText: 'Trending on Audius',
    modalButtonInfo: {
      incomplete: linkButtonMap.trendingTracks,
      inProgress: linkButtonMap.trendingTracks,
      complete: linkButtonMap.trendingTracks
    }
  },
  'mobile-install': {
    id: 'mobile-install' as ChallengeRewardID,
    title: 'Get the Audius Mobile App',
    icon: <i className='emoji large mobile-phone-with-arrow' />,
    description: challenge => `Earn ${challenge?.amount} $AUDIO`,
    fullDescription: () =>
      'Install the Audius app for iPhone and Android and Sign in to your account!',
    progressLabel: 'Not Installed',
    amount: amounts['mobile-install'],
    panelButtonText: 'Get the App',
    modalButtonInfo: {
      incomplete: null,
      inProgress: null,
      complete: null
    }
  },
  'profile-completion': {
    id: 'profile-completion' as ChallengeRewardID,
    title: 'Complete Your Profile',
    icon: <i className='emoji large white-heavy-check-mark' />,
    description: challenge =>
      `Complete your Audius profile to earn ${challenge?.amount} $AUDIO`,
    fullDescription: () =>
      'Fill out the missing details on your Audius profile and start interacting with tracks and artists!',
    progressLabel: '%0/%1 Complete',
    amount: amounts['profile-completion'],
    panelButtonText: 'More Info',
    modalButtonInfo: {
      incomplete: linkButtonMap.profile,
      inProgress: linkButtonMap.profile,
      complete: linkButtonMap.profile
    }
  },
  'track-upload': {
    id: 'track-upload' as ChallengeRewardID,
    title: 'Upload 3 Tracks',
    icon: <i className='emoji large multiple-musical-notes' />,
    description: challenge => `Earn ${challenge?.amount} $AUDIO`,
    fullDescription: () => 'Upload 3 tracks to your profile',
    progressLabel: '%0/%1 Uploaded',
    amount: amounts['track-upload'],
    panelButtonText: 'Upload Tracks',
    modalButtonInfo: {
      incomplete: linkButtonMap.trackUpload,
      inProgress: linkButtonMap.trackUpload,
      complete: linkButtonMap.trackUpload
    }
  }
}

type TrendingRewardsInfo = {
  id: TrendingRewardID
  title: string
  icon: ReactNode
  description: string
  buttonText: string
}

export const trendingRewardsConfig: Record<
  TrendingRewardID,
  TrendingRewardsInfo
> = {
  'trending-playlist': {
    title: 'Top 5 Trending Playlists',
    icon: <i className='emoji large chart-increasing' />,
    description: 'Winners are selected every Friday at Noon PT!',
    buttonText: 'See More',
    id: 'trending-playlist'
  },
  'trending-track': {
    title: 'Top 5 Trending Tracks',
    icon: <i className='emoji large chart-increasing' />,
    description: 'Winners are selected every Friday at Noon PT!',
    buttonText: 'See More',
    id: 'trending-track'
  },
  'top-api': {
    title: 'Top 10 API Apps',
    icon: <i className='emoji large nerd-face' />,
    description: 'The top 10 Audius API apps each month win',
    buttonText: 'More Info',
    id: 'top-api'
  },
  'verified-upload': {
    title: 'First Upload With Your Verified Account',
    icon: <i className='emoji large white-heavy-check-mark' />,
    description:
      'Verified on Twitter/Instagram? Upload your first track, post it on social media, & tag us',
    buttonText: 'More Info',
    id: 'verified-upload'
  },
  'trending-underground': {
    title: 'Top 5 Underground Trending',
    icon: <i className='emoji large chart-increasing' />,
    description: 'Winners are selected every Friday at Noon PT!',
    buttonText: 'See More',
    id: 'trending-underground'
  }
}
