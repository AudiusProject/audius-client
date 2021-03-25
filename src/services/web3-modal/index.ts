import Web3Modal from 'web3modal'

import WalletConnectProvider from '@walletconnect/web3-provider'
import { Bitski } from 'bitski'
// import Torus from '@toruslabs/torus-embed'
// import ethProvider from 'eth-provider'

const BITSKI_CLIENT_ID = process.env.REACT_APP_BITSKI_CLIENT_ID
const BITSKI_CALLBACK_URL = process.env.REACT_APP_BITSKI_CALLBACK_URL
const WEB3_NETWORK_ID = parseInt(process.env.REACT_APP_ETH_NETWORK_ID || '')
const ETH_PROVIDER_URLS = (process.env.REACT_APP_ETH_PROVIDER_URL || '').split(
  ','
)

// TODO: Put the providers behind a optimizely flag

export const createSession = async () => {
  try {
    const Web3 = window.Web3

    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            [WEB3_NETWORK_ID]: ETH_PROVIDER_URLS[0]
          }
        }
      },
      // torus: {
      //   package: Torus, // required
      //   options: {}
      // },
      // frame: {
      //   package: ethProvider // required
      // },
      bitski: {
        package: Bitski, // required
        options: {
          clientId: BITSKI_CLIENT_ID,
          callbackUrl: BITSKI_CALLBACK_URL
        }
      }
      /* See Provider Options Section */
    }

    const web3Modal = new Web3Modal({ providerOptions })

    const provider = await web3Modal.connect()

    const web3 = new Web3(provider)
    return web3
  } catch (err) {
    console.log({ err })
    if ('message' in err && err.message === 'Modal closed by user') {
      console.log('cloed by user')
    }
    console.log(err)
  }
}

export default createSession
