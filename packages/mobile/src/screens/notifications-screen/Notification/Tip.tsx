import { formatNumberCommas } from 'audius-client/src/common/utils/formatUtil'

import { AudioText } from 'app/components/core'

import { NotificationText } from './NotificationText'

type TipProps = {
  value: number
}

export const Tip = (props: TipProps) => {
  const { value } = props
  return (
    <NotificationText weight='bold'>
      {formatNumberCommas(value)} <AudioText fontSize='large' weight='bold' />
    </NotificationText>
  )
}
