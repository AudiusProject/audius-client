import React from 'react'

import { useSelector } from 'react-redux'

import { useScript } from 'hooks/useScript'
import AudiusBackend from 'services/AudiusBackend'
import { getUserHandle } from 'store/account/selectors'

const ClaimRewardButton = () => {
  const handle = useSelector(getUserHandle)
  const scriptLoaded = useScript('https://cdn.cognitohq.com/flow.js')

  const handleClick = async () => {
    const { signature } = await AudiusBackend.getCognitoSignature()

    // @ts-ignore
    const flow = new Flow({
      publishableKey: process.env.REACT_APP_COGNITO_KEY,
      templateId: process.env.REACT_APP_COGNITO_TEMPLATE_ID,
      user: {
        customerReference: handle,
        signature
      }
    })

    flow.on('ui', (event: any) => {
      switch (event.action) {
        // we can add subsequent logic here
        // e.g. what happens after the cognito window is "opened" or "closed"
        default:
        // nothing
      }
    })

    flow.open()
  }

  return handle && scriptLoaded ? (
    <button onClick={handleClick}>Claim your reward</button>
  ) : null
}

export default ClaimRewardButton
