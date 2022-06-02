import { User } from 'audius-client/src/common/models/User'
import {
  getMainUser,
  getSupporting
} from 'audius-client/src/common/store/tipping/selectors'

import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { Tip } from './Tip'

type SupporterInfoProps = {
  user: User
}

export const SupportingInfo = (props: SupporterInfoProps) => {
  const supportingMap = useSelectorWeb(getSupporting)
  const mainUser = useSelectorWeb(getMainUser)
  const supportingForUser = mainUser
    ? supportingMap[mainUser.user_id] ?? null
    : null
  const supporting = supportingForUser?.[props.user.user_id] ?? null

  return supporting ? <Tip amount={supporting.amount} /> : null
}
