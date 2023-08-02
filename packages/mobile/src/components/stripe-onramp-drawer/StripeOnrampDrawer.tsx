import { makeStyles } from 'app/styles'

import { AppDrawer } from '../drawer/AppDrawer'

import { StripeOnrampEmbed } from './StripeOnrampEmbed'

export const MODAL_NAME = 'StripeOnRamp'

const useStyles = makeStyles(({ spacing, typography, palette }) => ({
  top: {}
}))

export const StripeOnrampDrawer = () => {
  const styles = useStyles()

  return (
    <AppDrawer modalName={MODAL_NAME}>
      <StripeOnrampEmbed />
    </AppDrawer>
  )
}
