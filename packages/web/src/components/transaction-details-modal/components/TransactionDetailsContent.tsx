import {
  User,
  cacheUsersSelectors,
  TransactionDetails,
  TransactionMethod,
  formatNumberString,
  TransactionType,
  formatCapitalizeString,
  ChallengeRewardID
} from '@audius/common'
import cn from 'classnames'
import { useSelector } from 'react-redux'

import { ReactComponent as LogoCoinbase } from 'assets/img/LogoCoinbase.svg'
import { ReactComponent as LogoStripeLink } from 'assets/img/LogoStripeLink.svg'
import { ReactComponent as IconExternalLink } from 'assets/img/iconExternalLink.svg'
import { AudioTransactionIcon } from 'components/audio-transaction-icon'
import UserBadges from 'components/user-badges/UserBadges'
import { getChallengeConfig } from 'pages/audio-rewards-page/config'
import { AppState } from 'store/types'

import { Block, BlockContainer } from './Block'
import styles from './TransactionDetailsContent.module.css'
import { TransactionPurchaseMetadata } from './TransactionPurchaseMetadata'
const { getUsers } = cacheUsersSelectors

const messages = {
  transaction: 'Transaction',
  method: 'Method',
  date: 'Date',
  dateEarned: 'Date Earned',
  dateTransaction: 'Transaction Date',
  change: 'Change ($AUDIO)',
  balance: 'Balance ($AUDIO)',
  purchaseDescription: 'Purchased $AUDIO',
  trendingRewardDescription: 'Trending Competition Award',
  challengeRewardHeader: 'Challenge Completed',
  challengeRewardDescription: '$AUDIO Reward Earned',
  transferDescription: '$AUDIO ',
  transferSentHeader: 'Destination Wallet',
  transferReceivedHeader: 'Origin Wallet',
  tipDescription: 'Tip ',
  tipSentHeader: 'To User',
  tipReceivedHeader: 'From User',
  unknown: 'Unknown'
}

const transactionDescriptions: Record<TransactionType, string> = {
  [TransactionType.PURCHASE]: messages.purchaseDescription,
  [TransactionType.TIP]: messages.tipDescription,
  [TransactionType.TRANSFER]: messages.transferDescription,
  [TransactionType.TRENDING_REWARD]: messages.trendingRewardDescription,
  [TransactionType.CHALLENGE_REWARD]: messages.challengeRewardDescription
}

type UserDetailsProps = {
  userId: number
}

const UserDetails = ({ userId }: UserDetailsProps) => {
  const usersMap = useSelector<AppState, { [id: number]: User }>((state) =>
    getUsers(state, { ids: [userId] })
  )
  return (
    <>
      <div className={styles.name}>
        <span>{usersMap[userId].name}</span>
        <UserBadges
          userId={userId}
          className={styles.badge}
          badgeSize={14}
          inline
        />
      </div>
    </>
  )
}

const dateAndMetadataBlocks = (transactionDetails: TransactionDetails) => {
  switch (transactionDetails.transactionType) {
    case TransactionType.PURCHASE: {
      return (
        <>
          <TransactionPurchaseMetadata metadata={transactionDetails.metadata} />
          <Block header={messages.date}>{transactionDetails.date}</Block>
        </>
      )
    }
    case TransactionType.CHALLENGE_REWARD: {
      const challengeId = transactionDetails.metadata as ChallengeRewardID
      const challengeConfig = getChallengeConfig(challengeId)
      return (
        <>
          <Block
            className={styles.header}
            header={messages.challengeRewardHeader}
          >
            <div className={styles.icon}>{challengeConfig.icon}</div>
            {challengeConfig.title}
          </Block>
          <Block header={messages.dateEarned}>{transactionDetails.date}</Block>
        </>
      )
    }
    case TransactionType.TRENDING_REWARD: {
      return (
        <>
          <Block header={messages.dateEarned}>{transactionDetails.date}</Block>
        </>
      )
    }
    case TransactionType.TIP: {
      return (
        <>
          <Block header={messages.dateTransaction}>
            {transactionDetails.date}
          </Block>
          <Block
            className={styles.header}
            header={
              transactionDetails.method === TransactionMethod.SEND
                ? messages.tipSentHeader
                : messages.tipReceivedHeader
            }
          >
            <UserDetails userId={Number(transactionDetails.metadata)} />
          </Block>
        </>
      )
    }
    case TransactionType.TRANSFER: {
      return (
        <>
          <Block header={messages.dateTransaction}>
            {transactionDetails.date}
          </Block>
          <Block
            header={
              <a
                className={styles.link}
                href={`https://explorer.solana.com/address/${transactionDetails.metadata}`}
                target='_blank'
                title={transactionDetails.metadata}
                rel='noreferrer'
              >
                {transactionDetails.method === TransactionMethod.SEND
                  ? messages.transferSentHeader
                  : messages.transferReceivedHeader}
                <IconExternalLink />
              </a>
            }
          >
            {transactionDetails.metadata}
          </Block>
        </>
      )
    }
    default:
      return <></>
  }
}

export const TransactionDetailsContent = ({
  transactionDetails
}: {
  transactionDetails: TransactionDetails
}) => {
  const isNegative = transactionDetails.change.substring(0, 1) === '-'
  return (
    <BlockContainer>
      <div className={styles.flexHorizontal}>
        <Block header={messages.transaction}>
          {transactionDescriptions[transactionDetails.transactionType] +
            ([TransactionType.TIP, TransactionType.TRANSFER].includes(
              transactionDetails.transactionType
            )
              ? formatCapitalizeString(transactionDetails.method)
              : '')}
        </Block>
        <AudioTransactionIcon
          type={transactionDetails.transactionType}
          method={transactionDetails.method}
        />
      </div>
      {dateAndMetadataBlocks(transactionDetails)}

      {transactionDetails.transactionType === TransactionType.PURCHASE ? (
        <Block className={styles.header} header={messages.method}>
          {transactionDetails.method === TransactionMethod.COINBASE ? (
            <LogoCoinbase />
          ) : transactionDetails.method === TransactionMethod.STRIPE ? (
            <LogoStripeLink
              width={145}
              height={32}
              className={styles.stripeLogo}
            />
          ) : (
            messages.unknown
          )}
        </Block>
      ) : null}

      <Block header={messages.change}>
        <span className={cn(styles.change, { [styles.negative]: isNegative })}>
          {!isNegative ? '+' : ''}
          {formatNumberString(transactionDetails.change, { maxDecimals: 2 })}
        </span>
      </Block>
      <Block header={messages.balance}>
        {formatNumberString(transactionDetails.balance, { maxDecimals: 2 })}
      </Block>
    </BlockContainer>
  )
}
