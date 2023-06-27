import { h } from 'preact'

import AudiusLogoHorizontal from '../../assets/img/audiusLogoHorizontal.svg'
import Button from './Button'
import { getCopyableLink } from '../../util/shareUtil'

const AudiusLogoButton = () => {
  const onClick = () => window.open(getCopyableLink(), '_blank')

  return (
    <Button
      onClick={onClick}
      icon={<AudiusLogoHorizontal />}
    />
  )
}


export default AudiusLogoButton

