import { useCallback } from 'react'

import {
  Nullable,
  BNWei,
  tokenDashboardPageActions,
  walletSelectors,
  tokenDashboardPageSelectors,
  formatWei,
  buyAudioActions,
  OnRampProvider,
  FeatureFlags,
  StringKeys
} from '@audius/common'
import { Button, ButtonType, IconInfo } from '@audius/stems'
import BN from 'bn.js'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useAsync } from 'react-use'

import { ReactComponent as IconReceive } from 'assets/img/iconReceive.svg'
import { ReactComponent as IconSend } from 'assets/img/iconSend.svg'
import { ReactComponent as IconSettings } from 'assets/img/iconSettings.svg'
import IconGoldBadge from 'assets/img/tokenBadgeGold40@2x.png'
import { useModalState } from 'common/hooks/useModalState'
import { CollapsibleContent } from 'components/collapsible-content'
import MobileConnectWalletsDrawer from 'components/mobile-connect-wallets-drawer/MobileConnectWalletsDrawer'
import { OnRampButton } from 'components/on-ramp-button/OnRampButton'
import Tooltip from 'components/tooltip/Tooltip'
import { useFlag, useRemoteVar } from 'hooks/useRemoteConfig'
import { getLocation } from 'services/Location'
import { isMobile } from 'utils/clientUtil'

import TokenHoverTooltip from './TokenHoverTooltip'
import styles from './WalletManagementTile.module.css'
const { getHasAssociatedWallets } = tokenDashboardPageSelectors
const { pressReceive, pressSend, pressConnectWallets } =
  tokenDashboardPageActions
const { getAccountBalance, getAccountTotalBalance } = walletSelectors
const { startBuyAudioFlow } = buyAudioActions

const messages = {
  receiveLabel: 'Receive',
  sendLabel: 'Send',
  audio: '$AUDIO',
  manageWallets: 'Manage Wallets',
  connectWallets: 'Connect Other Wallets',
  totalAudio: 'Total $AUDIO',
  buyAudio: 'Buy $AUDIO',
  checkoutWithStripeOrCoinbase: 'Checkout with a credit card or Coinbase Pay',
  checkoutWithStripe: 'Checkout with a credit card',
  checkoutWithCoinbase: 'Checkout with Coinbase Pay',
  showAdvanced: 'Show Advanced',
  hideAdvanced: 'Hide Advanced',
  advancedOptions: 'Advanced Options',
  stripeRegionNotSupported:
    'Stripe payments are not yet supported in your region',
  coinbasePayRegionNotSupported:
    'Coinbase Pay is not yet supported in your region'
}

const AdvancedWalletActions = () => {
  const balance = useSelector(getAccountBalance) ?? (new BN(0) as BNWei)
  const hasBalance = balance && !balance.isZero()
  const dispatch = useDispatch()
  const [, openTransferDrawer] = useModalState('TransferAudioMobileWarning')

  const mobile = isMobile()
  const onClickReceive = useCallback(() => {
    if (mobile) {
      openTransferDrawer(true)
    } else {
      dispatch(pressReceive())
    }
  }, [dispatch, mobile, openTransferDrawer])

  const onClickSend = useCallback(() => {
    if (mobile) {
      openTransferDrawer(true)
    } else {
      dispatch(pressSend())
    }
  }, [mobile, dispatch, openTransferDrawer])
  const [, setOpen] = useModalState('MobileConnectWalletsDrawer')

  const onClickConnectWallets = useCallback(() => {
    if (mobile) {
      setOpen(true)
    } else {
      dispatch(pressConnectWallets())
    }
  }, [mobile, setOpen, dispatch])

  const onCloseConnectWalletsDrawer = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const hasMultipleWallets = useSelector(getHasAssociatedWallets)
  return (
    <div className={styles.advancedSection}>
      <div className={styles.subtitle}>{messages.advancedOptions}</div>
      <div className={styles.advancedOptions}>
        <Button
          className={cn(styles.advancedButton, {
            [styles.disabled]: !hasBalance
          })}
          text={messages.sendLabel}
          isDisabled={!hasBalance}
          includeHoverAnimations={hasBalance}
          textClassName={styles.textClassName}
          onClick={onClickSend}
          leftIcon={<IconSend className={styles.iconStyle} />}
          type={ButtonType.GLASS}
          minWidth={200}
        />
        <Button
          className={cn(styles.advancedButton)}
          text={messages.receiveLabel}
          textClassName={styles.textClassName}
          onClick={onClickReceive}
          leftIcon={<IconReceive className={styles.iconStyle} />}
          type={ButtonType.GLASS}
          minWidth={200}
        />
        <Button
          className={cn(styles.advancedButton, styles.manageWalletsButton)}
          text={
            hasMultipleWallets
              ? messages.manageWallets
              : messages.connectWallets
          }
          includeHoverAnimations
          textClassName={styles.textClassName}
          onClick={onClickConnectWallets}
          type={ButtonType.GLASS}
          leftIcon={<IconSettings className={styles.iconStyle} />}
          minWidth={200}
        />
        {mobile && (
          <MobileConnectWalletsDrawer onClose={onCloseConnectWalletsDrawer} />
        )}
      </div>
    </div>
  )
}

export const WalletManagementTile = () => {
  const dispatch = useDispatch()
  const totalBalance: Nullable<BNWei> =
    useSelector(getAccountTotalBalance) ?? null
  const hasMultipleWallets = useSelector(getHasAssociatedWallets)
  const [, setOpen] = useModalState('AudioBreakdown')

  const { isEnabled: isCoinbaseEnabled } = useFlag(
    FeatureFlags.BUY_AUDIO_COINBASE_ENABLED
  )
  const { isEnabled: isStripeEnabled } = useFlag(
    FeatureFlags.BUY_AUDIO_STRIPE_ENABLED
  )
  const coinbaseAllowedCountries = (
    useRemoteVar(StringKeys.COINBASE_PAY_ALLOWED_COUNTRIES) ?? ''
  ).split(',')
  const stripeAllowedCountries = (
    useRemoteVar(StringKeys.STRIPE_ALLOWED_COUNTRIES) ?? ''
  ).split(',')
  const stripeDeniedRegions = (
    useRemoteVar(StringKeys.STRIPE_DENIED_REGIONS) ?? ''
  ).split(',')

  const { value } = useAsync(getLocation, [])

  const isCoinbaseAllowed =
    !value ||
    coinbaseAllowedCountries.some((c) => c === value.country_code_iso3)
  const isStripeAllowed =
    !value ||
    (stripeAllowedCountries.some((c) => c === value.country_code_iso3) &&
      !stripeDeniedRegions.some((r) => r === value.region_code))

  const onClickOpen = useCallback(() => {
    setOpen(true)
  }, [setOpen])

  const onBuyWithCoinbaseClicked = useCallback(() => {
    dispatch(startBuyAudioFlow({ provider: OnRampProvider.COINBASE }))
  }, [dispatch])

  const onBuyWithStripeClicked = useCallback(() => {
    dispatch(startBuyAudioFlow({ provider: OnRampProvider.STRIPE }))
  }, [dispatch])

  return (
    <div className={styles.walletManagementTile}>
      <div className={styles.balanceContainer}>
        <TokenHoverTooltip balance={totalBalance || (new BN(0) as BNWei)}>
          <div
            className={cn(styles.balanceAmount, {
              [styles.hidden]: !totalBalance
            })}
          >
            {formatWei(totalBalance || (new BN(0) as BNWei), true, 0)}
          </div>
        </TokenHoverTooltip>
        <div
          className={cn(styles.balance, {
            [styles.hidden]: !totalBalance
          })}
        >
          {hasMultipleWallets ? (
            <div onClick={onClickOpen}>
              {messages.totalAudio}
              <IconInfo className={styles.iconInfo} />
            </div>
          ) : (
            messages.audio
          )}
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.header}>
          <img
            className={styles.headerIcon}
            src={IconGoldBadge}
            alt='Gold $AUDIO token'
          />
          <div className={styles.headerText}>
            <div className={styles.title}>{messages.buyAudio}</div>
            <div className={styles.subtitle}>
              {isCoinbaseEnabled && isStripeEnabled
                ? messages.checkoutWithStripeOrCoinbase
                : isCoinbaseEnabled
                ? messages.checkoutWithCoinbase
                : messages.checkoutWithStripe}
            </div>
          </div>
        </div>
        <div className={styles.onRampButtons}>
          {isStripeEnabled ? (
            <Tooltip
              disabled={isStripeAllowed}
              className={styles.tooltip}
              text={messages.stripeRegionNotSupported}
              color={'--secondary'}
              shouldWrapContent={false}
            >
              <div>
                <OnRampButton
                  provider={OnRampProvider.STRIPE}
                  className={styles.onRampButton}
                  disabled={!isStripeAllowed}
                  isDisabled={!isStripeAllowed}
                  onClick={onBuyWithStripeClicked}
                />
              </div>
            </Tooltip>
          ) : null}
          {isCoinbaseEnabled ? (
            <Tooltip
              disabled={isCoinbaseAllowed}
              className={styles.tooltip}
              text={messages.coinbasePayRegionNotSupported}
              color={'--secondary'}
              shouldWrapContent={false}
            >
              <div>
                <OnRampButton
                  provider={OnRampProvider.COINBASE}
                  className={styles.onRampButton}
                  disabled={!isCoinbaseAllowed}
                  isDisabled={!isCoinbaseAllowed}
                  onClick={onBuyWithCoinbaseClicked}
                />
              </div>
            </Tooltip>
          ) : null}
        </div>
        <CollapsibleContent
          id='advanced-wallet-actions'
          className={styles.toggle}
          toggleButtonClassName={styles.advancedToggle}
          showText={messages.showAdvanced}
          hideText={messages.hideAdvanced}
        >
          <AdvancedWalletActions />
        </CollapsibleContent>
      </div>
    </div>
  )
}
