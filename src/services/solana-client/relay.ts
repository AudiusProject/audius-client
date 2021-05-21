// NOTE: Must be https
// export const IDENTITY_SERVICE = process.env.REACT_APP_IDENTITY_SERVICE
export const IDENTITY_SERVICE = 'https://885c671cf853.ngrok.io' // process.env.REACT_APP_IDENTITY_SERVICE

type TransactionData = {
  recentBlockhash: string
  secpInstruction?: {
    publicKey: any
    message: string
    signature: any
    recoveryId: number
  }
  instruction: {
    keys: {
      pubkey: string
      isSigner?: boolean
      isWritable?: boolean
    }[]
    programId: string
    data: any
  }
}

const relay = async (transactionData: TransactionData) => {
  try {
    const response = await fetch(`${IDENTITY_SERVICE}/solana/relay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    })
    if (!response.ok) {
      throw new Error('Bad network response')
    }
    const responseJson = await response.json()
    return responseJson
  } catch (e) {
    console.error(e)
    return {}
  }
}

export default relay
