import {
  HarmonyButton,
  HarmonyButtonSize,
  HarmonyButtonType,
  IconCart
} from '@audius/stems'

import { Icon } from 'components/Icon'
import { Tile } from 'components/tile'
import { Text } from 'components/typography'

import styles from './NoTransactionsContent.module.css'

export type NoTransactionsContentProps = {
  headerText: string
  bodyText: string
  ctaText: string
  onCTAClicked: () => void
}

export const NoTransactionsContent = ({
  headerText,
  bodyText,
  ctaText,
  onCTAClicked
}: NoTransactionsContentProps) => {
  return (
    <Tile elevation='far' size='large' className={styles.tileContainer}>
      <div className={styles.contentContainer}>
        <Icon icon={IconCart} color='neutralLight4' size='xxxLarge' />
        <Text variant='heading' size='small'>
          {headerText}
        </Text>
        <Text variant='body' size='large'>
          {bodyText}
        </Text>
      </div>
      <HarmonyButton
        variant={HarmonyButtonType.SECONDARY}
        size={HarmonyButtonSize.SMALL}
        text={ctaText}
        onClick={onCTAClicked}
      />
    </Tile>
  )
}
