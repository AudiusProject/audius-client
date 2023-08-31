import {
  BNUSDC,
  formatCurrencyBalance,
  formatUSDCWeiToNumber
} from '@audius/common'
import {
  IconNote,
  IconKebabHorizontal,
  IconQuestionCircle,
  HarmonyButton,
  HarmonyButtonType,
  PopupMenu,
  PopupMenuItem,
  HarmonyPlainButton,
  HarmonyPlainButtonType
} from '@audius/stems'
import BN from 'bn.js'

import { Icon } from 'components/Icon'
import { Text } from 'components/typography'

import styles from './USDCCard.module.css'

const messages = {
  usdc: 'USDC',
  earn: 'Earn USDC by selling your music',
  learnMore: 'Learn More',
  withdraw: 'Withdraw Funds',
  salesSummary: 'Sales Summary',
  withdrawalHistory: 'Withdrawal History'
}

export const USDCCard = ({ balance }: { balance: BNUSDC }) => {
  const balanceNumber = formatUSDCWeiToNumber((balance ?? new BN(0)) as BNUSDC)
  const balanceFormatted = formatCurrencyBalance(balanceNumber)

  const menuItems: PopupMenuItem[] = [
    {
      text: messages.salesSummary,
      // TODO: link to sales page https://linear.app/audius/issue/PAY-1763/wire-up-salespurchases-pages-on-artist-dashboard
      onClick: () => {}
    },
    {
      text: messages.withdrawalHistory,
      // TODO: link to withdraw history page https://linear.app/audius/issue/PAY-1763/wire-up-salespurchases-pages-on-artist-dashboard
      onClick: () => {}
    }
  ]

  return (
    <div className={styles.usdcContainer}>
      <div className={styles.backgroundBlueGradient}>
        <div className={styles.usdcTitleContainer}>
          <div className={styles.usdcTitle}>
            {/* TODO: update icon https://linear.app/audius/issue/PAY-1764/update-icons-in-usdc-tile */}
            <Icon icon={IconNote} size='xxxLarge' color='staticWhite' />
            <div className={styles.usdc}>
              <Text
                variant='heading'
                size='xxLarge'
                color='staticWhite'
                strength='strong'
              >
                {messages.usdc}
              </Text>
            </div>
          </div>
          <Text
            variant='heading'
            color='staticWhite'
            strength='strong'
            size='xxLarge'
          >
            ${balanceFormatted}
          </Text>
        </div>
        <div className={styles.usdcInfo}>
          <Text color='staticWhite'>{messages.earn}</Text>
          <HarmonyPlainButton
            // TODO: wire up learn more link https://linear.app/audius/issue/PAY-1762/wire-up-learn-more-link
            onClick={() => {}}
            iconLeft={IconQuestionCircle}
            variant={HarmonyPlainButtonType.INVERTED}
            text={messages.learnMore}
          />
        </div>
      </div>
      <div className={styles.withdrawContainer}>
        <div className={styles.withdrawButton}>
          <HarmonyButton
            variant={HarmonyButtonType.SECONDARY}
            text={messages.withdraw}
            fullWidth
            // TODO: update leftIcon and wire up withdraw modal https://linear.app/audius/issue/PAY-1754/usdc-withdrawal-flow-ui
            iconLeft={() => <Icon icon={IconNote} size='medium' />}
            onClick={() => {}}
          />
        </div>
        <PopupMenu
          transformOrigin={{ horizontal: 'center', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          items={menuItems}
          renderTrigger={(anchorRef, triggerPopup) => (
            <HarmonyButton
              ref={anchorRef}
              variant={HarmonyButtonType.SECONDARY}
              iconLeft={IconKebabHorizontal}
              onClick={triggerPopup}
            />
          )}
        />
      </div>
    </div>
  )
}