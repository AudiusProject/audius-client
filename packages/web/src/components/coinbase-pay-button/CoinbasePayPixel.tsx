export default null
// import { useCallback, useEffect, useState } from 'react'

// import { initOnRamp } from '@coinbase/cbpay-js'
// import { Keypair } from '@solana/web3.js'
// import cn from 'classnames'
// import { useSelector } from 'utils/reducer'
// import { AppState } from 'store/types'

// const getCoinbasePayConfig = (state: AppState) => state.ui.coinbasePayPixel.config

// export const allowedCoinbasePayTokens = ['SOL']

// export const CoinbasePayPixel = () => {
//   const [isReady, setIsReady] = useState(false)
//   const [cbInstance, setCbInstance] = useState<any>()

//   const coinbasePayConfig = useSelector(getCoinbasePayConfig)

//   useEffect(() => {
//     const instance = initOnRamp({
//         appId: '2cbd65dc-1710-4ae3-ab28-8947b08c22fb',
//         widgetParameters: {
//         destinationWallets: [
//             {
//             address: destinationWallet,
//             blockchains: ['solana'],
//             assets: ['SOL']
//             }
//         ],
//         presetCryptoAmount: amount
//         },
//         onReady: () => {
//         // Update loading/ready states.
//         setIsReady(true)
//         },
//         onSuccess,
//         onExit,
//         onEvent: (event: any) => {
//         // event stream
//         },
//         experienceLoggedIn: 'popup',
//         experienceLoggedOut: 'popup'
//     })
//     setCbInstance(instance)
//   }, [wallet, amount, setCbInstance, onExit, onSuccess])

//   const openCbPay = useCallback(() => {
//     cbInstance?.open()
//   }, [cbInstance])

//   return null
// }
