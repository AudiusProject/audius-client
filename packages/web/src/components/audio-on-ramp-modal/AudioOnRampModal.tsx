import { useState, useCallback, useEffect } from 'react'

import { JupiterProvider } from '@jup-ag/react-hook'
import { Connection, Keypair } from '@solana/web3.js'
import { useSelector } from 'react-redux'

import { getAccountUser } from 'common/store/account/selectors'
import { useDevModeHotkey } from 'hooks/useHotkey'
import ModalDrawer from 'pages/audio-rewards-page/components/modals/ModalDrawer'

import styles from './AudioOnRampModal.module.css'
import { ExchangeConfirmationPage } from './ExchangeConfirmationPage'
import { InputAmountPage } from './InputAmountPage'
import { ModalContentPages } from './ModalContentPages'
import { SuccessPage } from './SuccessPage'
import { WalletInputPage } from './WalletInputPage'

const cluster = 'mainnet-beta'

export const AudioOnRampModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [wallet, setWallet] = useState<Keypair>()
  const [amount, setAmount] = useState(0)
  const [inputToken, setInputToken] = useState()
  const [outputToken, setOutputToken] = useState()
  const [exchangeResult, setExchangeResult] = useState()
  const hotkeyToggle = useDevModeHotkey(80 /* p */)

  const account = useSelector(getAccountUser)
  // Using a different RPC node for now since the one in libs won't list the Tokens
  const connection = new Connection('https://ssc-dao.genesysgo.net', {
    disableRetryOnRateLimit: true
  })

  const goToNextPage = useCallback(() => {
    setCurrentPage(currentPage + 1)
  }, [currentPage, setCurrentPage])
  const goToPrevPage = useCallback(() => {
    setCurrentPage(currentPage - 1)
  }, [currentPage, setCurrentPage])

  const handleWalletSubmit = useCallback(
    (keypair: Keypair) => {
      setWallet(keypair)
      goToNextPage()
    },
    [setWallet, goToNextPage]
  )

  const handleInputCompleted = useCallback(
    ({ amount, inputToken, outputToken }) => {
      setAmount(amount)
      setInputToken(inputToken)
      setOutputToken(outputToken)
      goToNextPage()
    },
    [setAmount, setInputToken, setOutputToken, goToNextPage]
  )

  const handleExchangeCompleted = useCallback(
    result => {
      setExchangeResult(result)
      goToNextPage()
    },
    [setExchangeResult, goToNextPage]
  )

  const handleClose = useCallback(() => {
    if (isOpen) {
      setIsOpen(false)
    }
  }, [isOpen, setIsOpen])

  useEffect(() => {
    if (hotkeyToggle) {
      setCurrentPage(0)
      setIsOpen(true)
    }
  }, [hotkeyToggle, setIsOpen])

  return (
    <ModalDrawer
      bodyClassName={styles.modalBody}
      onClose={handleClose}
      isOpen={isOpen}
      showTitleHeader
      title={'Buy $AUDIO'}
      useGradientTitle={false}
      showDismissButton
    >
      {account && connection ? (
        <JupiterProvider
          connection={connection}
          cluster={cluster}
          userPublicKey={wallet?.publicKey}
        >
          <ModalContentPages currentPage={currentPage}>
            <WalletInputPage onSubmit={handleWalletSubmit} />
            <InputAmountPage
              wallet={wallet}
              onComplete={handleInputCompleted}
            />
            <ExchangeConfirmationPage
              wallet={wallet}
              amount={amount}
              inputToken={inputToken}
              outputToken={outputToken}
              onGoBack={goToPrevPage}
              onExchangeCompleted={handleExchangeCompleted}
            />
            <SuccessPage
              swapResult={exchangeResult}
              inputToken={inputToken}
              outputToken={outputToken}
            />
          </ModalContentPages>
        </JupiterProvider>
      ) : null}
    </ModalDrawer>
  )
}
