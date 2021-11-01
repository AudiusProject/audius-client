import React, { useCallback, useState } from 'react'

import { Button, ButtonType } from '@audius/stems'
import { ChangeEvent } from 'react-slick/node_modules/@types/react'

import useHotkeys from 'hooks/useHotkey'

import styles from './DiscoveryNodeSelectionPreview.module.css'

const ENABLE_KEY = 'enable-discovery-node-selection-preview'

const useSetupHotkey = (keyCode: number) => {
  const [isEnabled, setIsEnabled] = useState(false)

  const listener = useCallback(() => {
    if (
      process.env.REACT_APP_ENVIRONMENT === 'production' &&
      (!window.localStorage || !window.localStorage.getItem(ENABLE_KEY))
    )
      return
    setIsEnabled(e => !e)
  }, [])

  useHotkeys({ [keyCode]: listener })

  return isEnabled
}

const DiscoveryNodeSelectionPreview = () => {
  const isEnabled = useSetupHotkey(68 /* d */)
  const [endpoint, setEndpoint] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const handleDiscoveryNodeSelection = async () => {
    const healthyEndpoints = (
      await (await fetch('https://api.audius.co')).json()
    ).data
    const url = endpoint.endsWith('/')
      ? endpoint.substring(0, endpoint.length - 1)
      : endpoint
    if (healthyEndpoints.includes(url)) {
      const item = {
        endpoint: url,
        timestamp: Date.now()
      }
      window.localStorage.setItem(
        '@audius/libs:discovery-node-timestamp',
        JSON.stringify(item)
      )
      setEndpoint('')
      setSuccess(true)
      setError(false)
    } else {
      setError(true)
      setSuccess(false)
    }
  }

  return isEnabled ? (
    <div className={styles.container}>
      <div className={styles.title}>Discovery Node Selection Preview</div>
      <div className={styles.inputContainer}>
        <input
          autoFocus
          // not using messages variable because this is not intended for end user
          placeholder='Please enter a valid discovery node'
          value={endpoint}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEndpoint(e.target.value.trim())
          }
        />

        <Button
          // not using messages variable because this is not intended for end user
          text='Apply'
          type={ButtonType.PRIMARY_ALT}
          onClick={handleDiscoveryNodeSelection}
        />
      </div>
      {success && (
        <div className={styles.success}>
          New discovery provider successfully set
        </div>
      )}
      {error && (
        <div className={styles.error}>
          Could not set discovery provider (does not exist or currently
          unhealty)
        </div>
      )}
    </div>
  ) : null
}

export default DiscoveryNodeSelectionPreview
