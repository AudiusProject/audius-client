import { useCallback, useEffect } from 'react'

import { useDispatch } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import {
  FlowUIOpenEvent,
  FlowUICloseEvent,
  FlowSessionEvent,
  FlowErrorEvent
} from 'common/models/AudioRewards'
import { getUserHandle } from 'common/store/account/selectors'
import {
  CognitoFlowStatus,
  setCognitoFlowStatus
} from 'common/store/pages/audio-rewards/slice'
import { useScript } from 'hooks/useScript'
import AudiusBackend from 'services/AudiusBackend'
import { COGNITO_SCRIPT_URL } from 'utils/constants'
import { useSelector } from 'utils/reducer'

declare global {
  interface Window {
    Flow: any
  }
}

/**
 * The CognitoModal isn't a true modal. It uses the Cognito Flow SDK to trigger an externally controlled modal
 */
export const CognitoModal = () => {
  const dispatch = useDispatch()
  const [isOpen] = useModalState('Cognito')
  const scriptLoaded = useScript(COGNITO_SCRIPT_URL)
  const handle = useSelector(getUserHandle)

  const triggerFlow = useCallback(async () => {
    const { signature } = await AudiusBackend.getCognitoSignature()
    if (!signature) {
      console.error('COGNITO: Failed to get Cognito signature')
      return
    }
    const flow = new window.Flow({
      publishableKey: process.env.REACT_APP_COGNITO_KEY,
      templateId: process.env.REACT_APP_COGNITO_TEMPLATE_ID,
      user: {
        customerReference: handle,
        signature
      }
    })

    flow.on('ui', (event: FlowUIOpenEvent | FlowUICloseEvent) => {
      switch (event.action) {
        case 'opened':
          dispatch(setCognitoFlowStatus({ status: CognitoFlowStatus.OPENED }))
          break
        case 'closed':
          dispatch(setCognitoFlowStatus({ status: CognitoFlowStatus.CLOSED }))
          break
      }
    })

    flow.on('session', (event: FlowSessionEvent) => {
      switch (event.action) {
        case 'passed':
          console.info(
            'COGNITO: User successfully completed their Flow session'
          )
          flow.close()
          break
        case 'created':
          console.info('COGNITO: User started a new Flow session')
          break
        case 'resumed':
          console.info('COGNITO: User resumed an existing Flow session')
          break
        case 'failed':
          console.error('COGNITO: User failed their Flow session')
          flow.close()
          break
      }
    })

    flow.on('error', (event: FlowErrorEvent) => {
      console.error(`COGNITO: Flow error: ${event.message}`)
    })

    flow.open()
  }, [dispatch, handle])

  useEffect(() => {
    if (isOpen && scriptLoaded && handle) {
      triggerFlow()
    }
  }, [triggerFlow, isOpen, scriptLoaded, handle])

  return null
}

// Default export for use with lazy loading
export default CognitoModal
