import { useCallback } from 'react'

import { InAppAudioPurchaseMetadata, formatNumberString } from '@audius/common'
import { IconButton } from '@audius/stems'

import { ReactComponent as IconExternalLink } from 'assets/img/iconExternalLink.svg'
import {
  IconUSD,
  IconSOL,
  IconAUDIO
} from 'components/buy-audio-modal/components/Icons'

import { BlockContainer, Block } from './Block'
import styles from './TransactionPurchaseMetadata.module.css'

const messages = {
  cost: 'Cost',
  purchased: 'Purchased',
  convertedTo: 'Converted To',
  viewOnSolScan: 'View on Solscan'
}

export const TransactionPurchaseMetadata = ({
  metadata
}: {
  metadata: InAppAudioPurchaseMetadata
}) => {
  const handleSwapSolScanClicked = useCallback(() => {}, [])

  const handlePurchaseSolScanClicked = useCallback(() => {}, [])

  return (
    <BlockContainer>
      <Block header={messages.cost}>
        <IconUSD />
        {formatNumberString(metadata.usd, { minDecimals: 2, maxDecimals: 2 })}
      </Block>
      <Block
        header={
          <>
            {messages.purchased}
            <IconButton
              className={styles.iconButton}
              icon={<IconExternalLink />}
              title={messages.viewOnSolScan}
              aria-label={messages.viewOnSolScan}
              onClick={handlePurchaseSolScanClicked}
            />
          </>
        }
      >
        <IconSOL />
        {formatNumberString(metadata.sol, { maxDecimals: 2 })}
      </Block>
      <Block
        header={
          <>
            {messages.convertedTo}
            <IconButton
              className={styles.iconButton}
              icon={<IconExternalLink />}
              title={messages.viewOnSolScan}
              aria-label={messages.viewOnSolScan}
              onClick={handleSwapSolScanClicked}
            />
          </>
        }
      >
        <IconAUDIO />
        {formatNumberString(metadata.audio, { maxDecimals: 2 })}
      </Block>
    </BlockContainer>
  )
}
