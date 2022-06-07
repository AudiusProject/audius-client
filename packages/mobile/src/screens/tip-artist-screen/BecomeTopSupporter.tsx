import { formatWei } from "audius-client/src/common/utils/wallet"
import { View } from "react-native"
import { BNWei } from 'audius-client/src/common/models/Wallet'
import { makeStyles } from "app/styles"
import IconTrophy from 'app/assets/images/iconTrophy.svg'
import { useThemeColors } from "app/utils/theme"

const messages = {
  becomeTopSupporterPrefix: 'Tip ',
  becomeTopSupporterSuffix: ' $AUDIO To Become Their Top Supporter'
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
}))

type BecomeTopSupporterProps = {
  amountToTipToBecomeTopSupporter: BNWei
}

export const BecomeTopSupporter = ({ amountToTipToBecomeTopSupporter }: BecomeTopSupporterProps) => {
  const styles = useStyles()
  const { white } = useThemeColors()

  return (
    <View style={[styles.root]}>
        <IconTrophy fill={white} />
        <span>
          {messages.becomeTopSupporterPrefix}
          {formatWei(amountToTipToBecomeTopSupporter, true, 0)}
          {messages.becomeTopSupporterSuffix}
        </span>
      </View>
  )
}
