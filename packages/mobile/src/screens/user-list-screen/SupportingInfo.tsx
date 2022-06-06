import { User } from 'audius-client/src/common/models/User'
import { getSupporting } from 'audius-client/src/common/store/tipping/selectors'
import { getId as getSupportingId } from 'common/store/user-list/supporting/selectors'

import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { Tip } from './Tip'

type SupporterInfoProps = {
  user: User
}

export const SupportingInfo = (props: SupporterInfoProps) => {
  const supportingMap = useSelectorWeb(getSupporting)
  const supportingId = useSelectorWeb(getSupportingId)
  const supportingForUser = supportingId
    ? supportingMap[supportingId] ?? null
    : null
  const supporting = supportingForUser?.[props.user.user_id] ?? null

  return supporting ? <Tip amount={supporting.amount} /> : null
}
