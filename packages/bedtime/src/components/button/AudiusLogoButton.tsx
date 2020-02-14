import { h } from 'preact'

import AudiusLogoHorizontal from '../../assets/img/audiusLogoHorizontal.svg'
import Button from './Button'

const AudiusLogoButton = () => {
  const onClick = () => window.open('https://staging.audius.co', '_blank')

  return (
    <Button
      onClick={onClick}
      icon={<AudiusLogoHorizontal />}
    />
  )
}


export default AudiusLogoButton

