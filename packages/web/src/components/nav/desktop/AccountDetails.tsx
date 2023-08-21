import { accountSelectors } from '@audius/common'

import { Avatar } from 'components/avatar'
import { Link } from 'components/link'
import { Text } from 'components/typography'
import UserBadges from 'components/user-badges/UserBadges'
import { useSelector } from 'utils/reducer'
import { SIGN_IN_PAGE, profilePage } from 'utils/route'

import styles from './AccountDetails.module.css'
import NavAudio from './NavAudio'

const { getAccountUser } = accountSelectors

const messages = {
  haveAccount: 'Have an Account?',
  signIn: 'Sign in'
}

export const AccountDetails = () => {
  const account = useSelector((state) => getAccountUser(state))

  const profileLink = profilePage(account?.handle ?? '')

  return (
    <div className={styles.userHeader}>
      <div className={styles.accountWrapper}>
        <Avatar userId={account?.user_id} />
        <div className={styles.userInfo}>
          {account ? (
            <>
              <div className={styles.name}>
                <Link
                  to={profileLink}
                  variant='title'
                  size='small'
                  strength='weak'
                  className={styles.nameLink}
                >
                  {account.name}
                </Link>
                <UserBadges
                  userId={account.user_id}
                  badgeSize={12}
                  className={styles.badge}
                />
              </div>
              <Link
                variant='body'
                size='xSmall'
                to={profileLink}
              >{`@${account.handle}`}</Link>
            </>
          ) : (
            <>
              <Text variant='body' size='small' strength='strong'>
                {messages.haveAccount}
              </Text>
              <Link
                to={SIGN_IN_PAGE}
                variant='body'
                size='xSmall'
                strength='weak'
                color='secondary'
              >
                {messages.signIn}
              </Link>
            </>
          )}
        </div>
      </div>
      <NavAudio />
    </div>
  )
}
