import { h } from 'preact'

import AudiusLogoHorizontal from '../../assets/img/audiusLogoHorizontal.svg'
import Button from './Button'
import { getAudiusURL } from '../../util/shareUtil'

const AudiusLogoButton = () => {
  const onClick = () => window.open(getAudiusURL(), '_blank')

  return (
    <Button
      onClick={onClick}
      icon={<AudiusLogoHorizontal />}
    />
  )
}


export default AudiusLogoButton

