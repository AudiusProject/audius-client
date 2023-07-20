import type { ComponentType } from 'react'

import type { Nullable } from '@audius/common'
import { SvgProperties } from 'csstype'

import IconAllowAttribution from 'assets/img/creativeCommons/by.svg'
import IconCreativeCommons from 'assets/img/creativeCommons/cc.svg'
import IconNonCommercialUse from 'assets/img/creativeCommons/nc.svg'
import IconNoDerivatives from 'assets/img/creativeCommons/nd.svg'
import IconShareAlike from 'assets/img/creativeCommons/sa.svg'

export const computeLicenseIcons = (
  allowAttribution: boolean,
  commercialUse: boolean,
  derivativeWorks: Nullable<boolean>
) => {
  if (!allowAttribution) return null
  const icons: [Icon: ComponentType<SvgProperties>, key: string][] = [
    [IconCreativeCommons, 'cc'],
    [IconAllowAttribution, 'by']
  ]
  if (!commercialUse) icons.push([IconNonCommercialUse, 'nc'])
  if (derivativeWorks === true) icons.push([IconShareAlike, 'sa'])
  else if (derivativeWorks === false) icons.push([IconNoDerivatives, 'nd'])

  return icons
}
