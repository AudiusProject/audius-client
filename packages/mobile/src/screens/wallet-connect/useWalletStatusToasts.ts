import { useEffect } from 'react'

import {
  tokenDashboardPageActions,
  tokenDashboardPageSelectors
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { useToast } from 'app/hooks/useToast'
const { getError, getConfirmingWallet, getConfirmingWalletStatus, getRemoveWallet } =
  tokenDashboardPageSelectors
const { resetStatus, resetRemovedStatus, updateWalletError } =
  tokenDashboardPageActions

const messages = {
  newWalletConnected: 'New Wallet Connected!',
  walletRemoved: 'Wallet Successfully Removed!'
}

export const useWalletStatusToasts = () => {
  const dispatch = useDispatch()
  const confirmingWallet = useSelector(getConfirmingWallet)
  const confirmingWalletStatus = useSelector(getConfirmingWalletStatus)
  const { status: removeWalletStatus } = useSelector(getRemoveWallet)
  const errorMessage = useSelector(getError)

  const { toast } = useToast()

  useEffect(() => {
    if (confirmingWalletStatus === 'Confirmed') {
      // yes here
      console.log('add',{confirmingWallet})
      toast({ content: messages.newWalletConnected, type: 'info' })
      dispatch(resetStatus())
    }
  }, [toast, dispatch, confirmingWalletStatus])

  useEffect(() => {
    if (removeWalletStatus === 'Confirmed') {
      // yes here
      console.log('remove',{confirmingWallet})
      toast({ content: messages.walletRemoved, type: 'info' })
      dispatch(resetRemovedStatus())
    }
  }, [toast, dispatch, removeWalletStatus])

  useEffect(() => {
    if (errorMessage) {
      toast({ content: errorMessage, type: 'error' })
      dispatch(updateWalletError({ errorMessage: null }))
    }
  }, [toast, dispatch, errorMessage])
}
