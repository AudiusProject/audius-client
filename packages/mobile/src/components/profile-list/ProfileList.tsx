import type { User } from '@audius/common'

import type { CardListProps } from 'app/components/core'
import { CardList } from 'app/components/core'

import { ProfileCard } from './ProfileCard'
import { ProfileCardSkeleton } from './ProfileCardSkeleton'

type ListProps = Omit<CardListProps<User>, 'data' | 'renderItem'>

type ProfileListProps = {
  profiles: User[] | undefined
} & ListProps

export const ProfileList = (props: ProfileListProps) => {
  const { profiles, ...other } = props
  return (
    <CardList
      data={profiles}
      renderItem={({ item }) => <ProfileCard profile={item} />}
      LoadingCardComponent={ProfileCardSkeleton}
      {...other}
    />
  )
}
