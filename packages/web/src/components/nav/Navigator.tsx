import { Client } from '@audius/common'
import cn from 'classnames'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { getClient } from 'utils/clientUtil'

import styles from './Navigator.module.css'
import NavColumn from './desktop/NavColumn'
import ConnectedNavBar from './mobile/ConnectedNavBar'

interface OwnProps {
  className?: string
}

type NavigatorProps = OwnProps & RouteComponentProps

const Navigator = ({ className }: NavigatorProps) => {
  const client = getClient()

  const isMobile = client === Client.MOBILE

  return (
    <div
      className={cn(styles.navWrapper, className, {
        [styles.navColumnWrapper]: !isMobile
      })}
    >
      {isMobile ? (
        <ConnectedNavBar />
      ) : (
        <NavColumn isElectron={client === Client.ELECTRON} />
      )}
    </div>
  )
}

export default withRouter(Navigator)
