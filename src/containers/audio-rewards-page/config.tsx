import React, { ReactNode } from 'react'

import { ChallengeRewardID, TrendingRewardID } from './types'

type ChallengeRewardsInfo = {
  id: ChallengeRewardID
  title: string
  icon: ReactNode
  description: string
  fullDescription: string
  progressLabel: string
  amount: number
  stepCount: number
  buttonText: string
}

export const challengeRewardsConfig: Record<
  ChallengeRewardID,
  ChallengeRewardsInfo
> = {
  'invite-friends': {
    id: 'invite-friends' as const,
    title: 'Invite your Friends',
    icon: <i className='emoji large incoming-envelope' />,
    description: 'Earn 1 $AUDIO, for you and your friend',
    fullDescription:
      'Invite your Friends! You’ll earn 1 $AUDIO for each friend who joins with your link (and they’ll get an $AUDIO too)',
    progressLabel: '%0/%1 Invites',
    amount: 10,
    stepCount: 10,
    buttonText: 'Invite your Friends'
  },
  'connect-verified': {
    id: 'connect-verified' as const,
    title: 'Link Verified Accounts',
    icon: <i className='emoji large white-heavy-check-mark' />,
    description: 'Link your verified social media accounts to earn 10 $AUDIO',
    fullDescription:
      'Get verified on Audius by linking your verified Twitter or Instagram account!',
    progressLabel: 'Not Linked',
    amount: 10,
    stepCount: 1,
    buttonText: 'Link Verified Account'
  },
  'listen-streak': {
    id: 'listen-streak' as const,
    title: 'Listening Streak: 7 Days',
    icon: <i className='emoji large headphone' />,
    description: 'Listen to one track a day for seven days to earn 5 $AUDIO',
    fullDescription:
      'Sign in and listen to at least one track every day for 7 days',
    progressLabel: '%0/%1 Days',
    amount: 5,
    stepCount: 7,
    buttonText: 'Trending on Audius'
  },
  'mobile-app': {
    id: 'mobile-app' as const,
    title: 'Get the Audius Mobile App',
    icon: <i className='emoji large mobile-phone-with-arrow' />,
    description: 'Earn 10 $AUDIO',
    fullDescription:
      'Install the Audius app for iPhone and Android and Sign in to your account!',
    progressLabel: 'Not Installed',
    amount: 10,
    stepCount: 1,
    buttonText: 'Get the App'
  },
  'profile-completion': {
    id: 'profile-completion' as const,
    title: 'Complete your Profile',
    icon: <i className='emoji large white-heavy-check-mark' />,
    description: 'Complete your Audius profile to earn 5 $AUDIO',
    fullDescription:
      'Fill out the missing details on your Audius profile and start interacting with tracks and artists!',
    progressLabel: '%0/%1 Complete',
    amount: 10,
    stepCount: 7,
    buttonText: 'Your Profile'
  },
  'track-upload': {
    id: 'track-upload' as const,
    title: 'Upload 5 Tracks',
    icon: <i className='emoji large multiple-musical-notes' />,
    description: 'Earn 5 $AUDIO',
    fullDescription: 'Upload 3 tracks to your profile',
    progressLabel: '%0/%1 Uploaded',
    amount: 5,
    stepCount: 3,
    buttonText: 'Upload Tracks'
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
    id: 'trending-playlist' as const
  },
  'trending-track': {
    title: 'Top 5 Trending Tracks',
    icon: <i className='emoji large chart-increasing' />,
    description: 'Winners are selected every Friday at Noon PT!',
    buttonText: 'See More',
    id: 'trending-track' as const
  },
  'top-api': {
    title: 'Top 10 API Apps',
    icon: <i className='emoji large nerd-face' />,
    description: 'The top 10 Audius API apps each month win',
    buttonText: 'More Info',
    id: 'top-api' as const
  },
  'verified-upload': {
    title: 'First Upload With Your Verified Account',
    icon: <i className='emoji large white-heavy-check-mark' />,
    description:
      'Verified on Twitter/Instagram? Upload your first track, post it on social media, & tag us',
    buttonText: 'More Info',
    id: 'verified-upload' as const
  },
  'trending-underground': {
    title: 'Top 5 Underground Trending',
    icon: <i className='emoji large chart-increasing' />,
    description: 'Winners are selected every Friday at Noon PT!',
    buttonText: 'See More',
    id: 'trending-underground' as const
  }
}
