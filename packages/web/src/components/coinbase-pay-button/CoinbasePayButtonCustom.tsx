import { Button, ButtonProps, ButtonType } from '@audius/stems'
import cn from 'classnames'

import { ReactComponent as CoinbaseLogo } from 'assets/img/coinbase-pay/LogoCoinbase.svg'
import { isDarkMode, isMatrix } from 'utils/theme/theme'

import styles from './CoinbasePayButtonCustom.module.css'

const messages = {
  buyWith: 'Buy with',
  buyWithCoinbase: 'Buy with Coinbase'
}

export const CoinbasePayButtonCustom = (props: Partial<ButtonProps>) => {
  const darkMode = isDarkMode() || isMatrix()
  return (
    <Button
      aria-label={messages.buyWithCoinbase}
      text={
        <>
          <span>{messages.buyWith}</span>
          <CoinbaseLogo
            className={styles.coinbaseLogo}
            width={97}
            height={18}
          />
        </>
      }
      type={ButtonType.GLASS}
      includeHoverAnimations
      className={cn(styles.coinbaseButton, { [styles.darkMode]: darkMode })}
      textClassName={styles.textClassName}
      {...props}
    />
  )
}
