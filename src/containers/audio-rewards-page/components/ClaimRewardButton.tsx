import React, { useEffect } from 'react'

import { useSelector } from 'react-redux'

import { useScript } from 'hooks/useScript'
import AudiusBackend from 'services/AudiusBackend'
import { getUserHandle } from 'store/account/selectors'

let flow: any
const setFlow = async (customerReference: string) => {
  if (flow) return

  const { signature } = await AudiusBackend.getCognitoSignature()

  // @ts-ignore
  flow = new Flow({
    publishableKey: process.env.REACT_APP_COGNITO_KEY,
    templateId: process.env.REACT_APP_COGNITO_TEMPLATE_ID,
    user: {
      customerReference,
      signature
    }
  })
}

const ClaimRewardButton = () => {
  const scriptLoaded = useScript('https://cdn.cognitohq.com/flow.js')
  const handle = useSelector(getUserHandle)

  useEffect(() => {
    if (scriptLoaded && handle) setFlow(handle)
  }, [scriptLoaded, handle])

  const handleClick = () => {
    if (flow) {
      // @ts-ignore
      flow.open()
    }
  }
  return <button onClick={handleClick}>Claim your reward</button>
}

export default ClaimRewardButton
