import { User } from 'audius-client/src/common/models/User'

import { EmptyTile } from 'app/components/core'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { getIsOwner, useSelectProfile } from './selectors'

const messages = {
  you: 'You',
  haveNot: "haven't",
  hasNot: "hasn't",
  tracks: 'created any tracks yet',
  albums: 'created any albums yet',
  playlists: 'created any playlists yet',
  reposts: 'reposted anything yet'
}

type Tab = 'tracks' | 'albums' | 'playlists' | 'reposts'

export const useEmptyProfileText = (profileUser: User, tab: Tab) => {
  const { name } = useSelectProfile(['name'])
  const isOwner = useSelectorWeb(getIsOwner)

  const youAction = `${messages.you} ${messages.haveNot}`
  const nameAction = `${name} ${messages.hasNot}`
  return `${isOwner ? youAction : nameAction} ${messages[tab]}`
}

type EmptyProfileTileProps = {
  tab: Tab
}

export const EmptyProfileTile = (props: EmptyProfileTileProps) => {
  const { tab } = props
  const profile = useSelectProfile(['user_id', 'name'])
  const emptyText = useEmptyProfileText(profile, tab)

  return <EmptyTile message={emptyText} />
}
