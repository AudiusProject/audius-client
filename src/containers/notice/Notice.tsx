import React, { useCallback, useState } from 'react'
import cn from 'classnames'
import { useRemoteVar } from 'containers/remote-config/hooks'
import { BooleanKeys } from 'services/remote-config'

import styles from './Notice.module.css'
import { IconRemove } from '@audius/stems'

const messages = {
  degradedFunctionality:
    'We’re experiencing heavy load! Some functionality may be degraded. Please try again later.'
}

const DegradedFunctionalityNotice = () => (
  <>
    <span>{messages.degradedFunctionality}</span>
    <i className='emoji heavy-black-heart' />
  </>
)

const Notice = ({ shouldPadTop }: { shouldPadTop: boolean }) => {
  const [isHidden, setIsHidden] = useState(false)
  const hide = useCallback(() => setIsHidden(true), [setIsHidden])

  const showDegradedFunctionality = useRemoteVar(
    BooleanKeys.NOTICE_DEGRADED_FUNCTIONALITY
  )
  let content
  if (showDegradedFunctionality) {
    content = <DegradedFunctionalityNotice />
  }

  return (
    <div
      className={cn(styles.notice, {
        [styles.show]: !!content && !isHidden,
        [styles.shouldPadTop]: shouldPadTop
      })}
    >
      <div className={styles.content}>
        <IconRemove className={styles.iconRemove} onClick={hide} />
        {content}
      </div>
    </div>
  )
}

export default Notice
