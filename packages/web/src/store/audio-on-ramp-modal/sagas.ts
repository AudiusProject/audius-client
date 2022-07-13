import { initOnRamp } from '@coinbase/cbpay-js'
import { eventChannel } from 'redux-saga'
import { call, put, take, takeLatest } from 'typed-redux-saga'

import {
  init,
  open,
  statusUpdate,
  CoinbasePayStatus,
  destroy
} from 'common/store/coinbase-pay-pixel/slice'

function initOnRampChannel({
  destinationWallet,
  amount,
  assets
}: {
  destinationWallet: string
  amount: number
  assets: string[]
}) {
  return eventChannel<{
    state: CoinbasePayStatus
    openCallback?: () => void
  }>(emit => {
    const cbInstance = initOnRamp({
      appId: '2cbd65dc-1710-4ae3-ab28-8947b08c22fb',
      widgetParameters: {
        destinationWallets: [
          {
            address: destinationWallet,
            blockchains: ['solana'], // Only supporting Solana for now
            assets: assets
          }
        ],
        presetCryptoAmount: amount
      },
      closeOnExit: true,
      closeOnSuccess: true,
      onReady: function () {
        console.log(cbInstance)
        emit({
          state: CoinbasePayStatus.READY,
          openCallback: () => cbInstance.open()
        })
      },
      onSuccess: () => {
        emit({ state: CoinbasePayStatus.SUCCEEDED })
      },
      onExit: () => {
        emit({ state: CoinbasePayStatus.EXITED })
      },
      onEvent: (event: any) => {
        // event stream
      },
      experienceLoggedIn: 'embedded',
      experienceLoggedOut: 'embedded'
    })
    return () => cbInstance.destroy()
  })
}

function* handleOnInitCoinbasePay({ payload }: ReturnType<typeof init>) {
  const channel = yield* call(initOnRampChannel, payload)

  let isReady = false
  let openCallback: undefined | (() => void)

  try {
    while (!isReady || !openCallback) {
      const update = yield* take(channel)
      if (update.openCallback) {
        openCallback = update.openCallback
      }
      yield* put(statusUpdate({ status: update.state }))
      if (update.state === CoinbasePayStatus.READY) {
        isReady = true
      }
    }
    yield* takeLatest(open, function* () {
      if (openCallback) {
        yield* call(openCallback)
      }
    })

    yield* takeLatest(destroy, function* () {
      channel.close()
    })

    while (true) {
      const update = yield* take(channel)
      yield* put(statusUpdate({ status: update.state }))
    }
  } finally {
    yield* put(statusUpdate({ status: CoinbasePayStatus.IDLE }))
  }
}

function* watchCoinbasePay() {
  yield* takeLatest(init, handleOnInitCoinbasePay)
}

export default function sagas() {
  return [watchCoinbasePay]
}
