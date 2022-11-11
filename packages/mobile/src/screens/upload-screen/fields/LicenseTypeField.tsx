import { useCallback } from 'react'

import type { Nullable } from '@audius/common'
import { useField } from 'formik'
import { View } from 'react-native'

import { ContextualSubmenu, Pill } from 'app/components/core'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { computeLicenseIcons } from '../utils/computeLicenseIcons'

const messages = {
  licenseType: 'License Type',
  noLicense: 'All rights reserved'
}

const useStyles = makeStyles(({ spacing }) => ({
  licenseIcons: {
    marginTop: spacing(4),
    alignItems: 'flex-start'
  },
  licenseIcon: {
    marginRight: spacing(1)
  }
}))

export const LicenseTypeField = () => {
  const [{ value: license }] = useField<Nullable<string>>('license')
  const [{ value: allowAttribution }] = useField<boolean>(
    'licenseType.allowAttribution'
  )
  const [{ value: commercialUse }] = useField<boolean>(
    'licenseType.commercialUse'
  )
  const [{ value: derivativeWorks }] = useField<Nullable<boolean>>(
    'licenseType.derivativeWorks'
  )

  const styles = useStyles()
  const { neutral } = useThemeColors()

  const renderValue = useCallback(() => {
    const licenseIcons = computeLicenseIcons(
      allowAttribution,
      commercialUse,
      derivativeWorks
    )

    return licenseIcons ? (
      <View style={styles.licenseIcons}>
        <Pill>
          {licenseIcons.map(([Icon, key]) => (
            <Icon
              key={key}
              fill={neutral}
              style={styles.licenseIcon}
              height={20}
              width={20}
            />
          ))}
        </Pill>
      </View>
    ) : null
  }, [allowAttribution, commercialUse, derivativeWorks, styles, neutral])

  console.log('license', license)

  return (
    <ContextualSubmenu
      value={license ?? messages.noLicense}
      label={messages.licenseType}
      submenuScreenName='LicenseType'
      renderValue={license !== messages.noLicense ? renderValue : undefined}
    />
  )
}
