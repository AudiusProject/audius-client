import { BNWei } from 'audius-client/src/common/models/Wallet'
import { formatWei } from 'audius-client/src/common/utils/wallet'
import { Text } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import IconTrophy from 'app/assets/images/iconTrophy.svg'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

const messages = {
  becomeTopSupporterPrefix: 'Tip ',
  becomeTopSupporterSuffix: ' $AUDIO to become their top supporter'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  root: {
    marginBottom: spacing(6),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3),
    borderRadius: 4
  },
  text: {
    marginLeft: spacing(3.5),
    color: palette.white,
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontByWeight.demiBold
  }
}))

type BecomeTopSupporterProps = {
  amountToTipToBecomeTopSupporter: BNWei
}

export const BecomeTopSupporter = ({
  amountToTipToBecomeTopSupporter
}: BecomeTopSupporterProps) => {
  const styles = useStyles()
  const {
    white,
    pageHeaderGradientColor1,
    pageHeaderGradientColor2
  } = useThemeColors()

  return (
    <LinearGradient
      style={styles.root}
      colors={[pageHeaderGradientColor2, pageHeaderGradientColor1]}
    >
      <IconTrophy fill={white} width={16} height={16} />
      <Text style={styles.text}>
        {messages.becomeTopSupporterPrefix}
        {formatWei(amountToTipToBecomeTopSupporter, true, 0)}
        {messages.becomeTopSupporterSuffix}
      </Text>
    </LinearGradient>
  )
}
