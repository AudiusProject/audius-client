import { useCallback, useEffect, useState } from 'react'

import { StringKeys } from '@audius/common'
import { IconRemove } from '@audius/stems'
import cn from 'classnames'

import { useRemoteVar } from 'hooks/useRemoteConfig'

import styles from './Notice.module.css'

const Notice = ({ shouldPadTop }: { shouldPadTop: boolean }) => {
  const [isVisible, setIsVisible] = useState(false)
  const hide = useCallback(() => setIsVisible(false), [setIsVisible])

  const noticeText = useRemoteVar(StringKeys.APP_WIDE_NOTICE_TEXT)

  useEffect(() => {
    if (noticeText) {
      setIsVisible(true)
    }
  }, [noticeText])

  return (
    <div
      className={cn(styles.notice, {
        [styles.show]: isVisible,
        [styles.shouldPadTop]: shouldPadTop
      })}
    >
      <div
        className={cn(styles.content, {
          [styles.contentShow]: isVisible
        })}
      >
        <IconRemove className={styles.iconRemove} onClick={hide} />
        {noticeText}
      </div>
    </div>
  )
}

export default Notice
