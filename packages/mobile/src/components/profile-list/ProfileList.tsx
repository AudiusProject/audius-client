import type { User } from '@audius/common'

import type { CardListProps } from 'app/components/core'
import { CardList } from 'app/components/core'

import { ArtistCard, ArtistCardSkeleton } from '../artist-card'

type ListProps = Omit<CardListProps<User>, 'data' | 'renderItem'>

type ProfileListProps = {
  profiles: User[] | undefined
} & ListProps

export const ProfileList = (props: ProfileListProps) => {
  const { profiles, ...other } = props
  return (
    <CardList
      data={profiles}
      renderItem={({ item }) => <ArtistCard artist={item} />}
      LoadingCardComponent={ArtistCardSkeleton}
      {...other}
    />
  )
}
