import { apiClient } from 'services/audius-api-client'

enum BlockConfirmation {
  CONFIRMED = 'CONFIRMED',
  DENIED = 'DENIED',
  UNKNOWN = 'UNKNOWN'
}

const POLLING_FREQUENCY_MILLIS = 2000

export const confirmMutation =
  (
    performMutation: (
      requestOptions
    ) => Promise<{ blockHash: string; blockNumber: number }>
  ) =>
  async (options) => {
    // transaction
    const { blockHash, blockNumber } = await performMutation(options)

    // confirmer
    const confirmBlock = async () => {
      const { block_passed } = await apiClient.getBlockConfirmation(
        blockHash,
        blockNumber
      )

      return block_passed
        ? BlockConfirmation.CONFIRMED
        : BlockConfirmation.UNKNOWN
    }

    let confirmation: BlockConfirmation = await confirmBlock()

    // TODO If timeout, throw error
    while (confirmation === BlockConfirmation.UNKNOWN) {
      await new Promise((resolve) =>
        setTimeout(resolve, POLLING_FREQUENCY_MILLIS)
      )
      confirmation = await confirmBlock()
    }

    if (confirmation === BlockConfirmation.CONFIRMED) {
      // return optimisticResponse
      return new Response(
        JSON.stringify({ data: options.body.optimisticResponse })
      )
    } else {
      throw Error('Transaction failed')
    }
  }
