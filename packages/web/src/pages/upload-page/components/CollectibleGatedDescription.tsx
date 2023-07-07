import { useCallback } from 'react'

import { collectiblesSelectors } from '@audius/common'
import { Button, ButtonType } from '@audius/stems'
import { useSelector } from 'react-redux'

import { ReactComponent as IconExternalLink } from 'assets/img/iconExternalLink.svg'
import { HelpCallout } from 'components/help-callout/HelpCallout'

import styles from './CollectibleGatedDescription.module.css'

const { getHasUnsupportedCollection } = collectiblesSelectors
const messages = {
  collectibleGated: 'Collectible Gated',
  collectibleGatedSubtitle:
    'Users who own a digital collectible matching your selection will have access to your track. Collectible gated content does not appear on trending or in user feeds.',
  noCollectibles:
    'No Collectibles found. To enable this option, link a wallet containing a collectible.',
  compatibilityTitle: "Not seeing what you're looking for?",
  compatibilitySubtitle:
    'Unverified Solana NFT Collections are not compatible at this time.',
  learnMore: 'Learn More'
}

const LEARN_MORE_URL =
  'https://blog.audius.co/article/introducing-nft-collectible-gated-content'

export const CollectibleGatedDescription = ({
  hasCollectibles,
  isUpload
}: {
  hasCollectibles: boolean
  isUpload: boolean
}) => {
  const hasUnsupportedCollection = useSelector(getHasUnsupportedCollection)

  const renderContent = useCallback(() => {
    return hasUnsupportedCollection ? (
      <div>
        <div>{messages.compatibilityTitle}</div>
        <div>{messages.compatibilitySubtitle}</div>
      </div>
    ) : (
      messages.noCollectibles
    )
  }, [hasUnsupportedCollection])

  return (
    <div className={styles.innerDescription}>
      {messages.collectibleGatedSubtitle}
      {!hasCollectibles && isUpload ? (
        <HelpCallout content={renderContent()} />
      ) : null}
      <Button
        type={ButtonType.TEXT}
        className={styles.learnMoreButton}
        text={messages.learnMore}
        onClick={() => window.open(LEARN_MORE_URL, '_blank')}
        iconClassName={styles.learnMoreArrow}
        rightIcon={<IconExternalLink />}
      />
    </div>
  )
}
