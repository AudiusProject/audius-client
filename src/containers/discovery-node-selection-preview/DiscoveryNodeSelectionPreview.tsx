import React, { useState } from 'react'

import { Button, ButtonType } from '@audius/stems'
import { ChangeEvent } from 'react-slick/node_modules/@types/react'

import { usePreviewHotkey } from 'hooks/useHotkey'

import styles from './DiscoveryNodeSelectionPreview.module.css'

const DISCOVERY_NODE_SELECTION_ENABLE_KEY =
  'enable-discovery-node-selection-preview'

const DiscoveryNodeSelectionPreview = () => {
  const isEnabled = usePreviewHotkey(
    68 /* d */,
    DISCOVERY_NODE_SELECTION_ENABLE_KEY
  )
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
          unhealthy)
        </div>
      )}
    </div>
  ) : null
}

export default DiscoveryNodeSelectionPreview
