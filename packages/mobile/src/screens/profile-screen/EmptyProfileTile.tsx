import { User } from 'audius-client/src/common/models/User'
import { getAccountUser } from 'audius-client/src/common/store/account/selectors'
import { Nullable } from 'audius-client/src/common/utils/typeUtils'

import { EmptyTile } from 'app/components/core'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

const messages = {
  you: 'You',
  haveNot: "haven't",
  hasNot: "hasn't"
}

export const useEmptyProfileText = (
  profile: Nullable<User>,
  baseMessage: string
) => {
  const accountUser = useSelectorWeb(getAccountUser)

  if (!profile) return ''
  const { user_id, name } = profile
  const isOwner = user_id === accountUser?.user_id
  const youAction = `${messages.you} ${messages.haveNot}`
  const nameAction = `${name} ${messages.hasNot}`
  return `${isOwner ? youAction : nameAction} ${baseMessage}`
}

type EmptyProfileTileProps = {
  profile: User
  message: string
}

export const EmptyProfileTile = (props: EmptyProfileTileProps) => {
  const { message, profile } = props
  const emptyText = useEmptyProfileText(profile, message)

  return <EmptyTile message={emptyText} />
}
