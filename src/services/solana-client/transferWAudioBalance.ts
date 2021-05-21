import {
  AccountMeta,
  Connection,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY
} from '@solana/web3.js'
import BN from 'bn.js'
import * as borsh from 'borsh'
import keccak256 from 'keccak256'
import secp256k1 from 'secp256k1'
import {
  solanaClusterEndpoint,
  tokenProgramKey,
  audiusProgramPubkey,
  generatedProgramPDA
} from './config'
import SolanaClient from './index'

/**
 * Transfer wAUDIO between wallets on solana
 */

class TransferInstructionData {
  signature: Uint8Array
  eth_address: Uint8Array
  recovery_id: number

  constructor({
    signature,
    ethAddress,
    recoveryId
  }: {
    signature: Uint8Array
    ethAddress: Uint8Array
    recoveryId: number
  }) {
    this.signature = signature
    this.eth_address = ethAddress
    this.recovery_id = recoveryId
  }
}

const transferInstructionSchema = new Map([
  [
    TransferInstructionData,
    {
      kind: 'struct',
      fields: [
        ['signature', [64]],
        ['eth_address', [20]],
        ['recovery_id', 'u8']
      ]
    }
  ]
])

// transferWAudioBalance transfers wrapped Audio from one generated solana account to another.
// For it to work, you have to have the eth private key belonging to the eth public key
// that generated the solana account
export async function transferWAudioBalance(
  senderEthAddress: string,
  senderEthPrivateKey: string,
  senderSolanaAddress: string,
  recipientSolanaAddress: string
) {
  const ethAddressArr = Uint8Array.of(
    ...new BN(senderEthAddress, 'hex').toArray('be')
  )

  const ethPrivateKeyArr = Buffer.from(senderEthPrivateKey, 'hex')

  const senderSolanaPubkey = new PublicKey(senderSolanaAddress)
  const recipeintPubkey = new PublicKey(recipientSolanaAddress)

  // hash the recipient solana pubkey and create signature
  const msgHash = keccak256(recipeintPubkey.toBytes())
  const signatureObj = secp256k1.ecdsaSign(
    Uint8Array.from(msgHash),
    ethPrivateKeyArr
  )

  const instructionData = new TransferInstructionData({
    signature: signatureObj.signature,
    recoveryId: signatureObj.recid,
    ethAddress: ethAddressArr
  })

  // serialize it
  const serializedInstructionData = borsh.serialize(
    transferInstructionSchema,
    instructionData
  )

  // give it the rust enum tag
  // we can do this better all with borsh - look in
  // identity or ask cheran
  const serializedInstructionEnum = Uint8Array.of(
    1,
    ...serializedInstructionData
  )

  const connection = new Connection(solanaClusterEndpoint)

  const accounts: AccountMeta[] = [
    // sender account (bank)
    { pubkey: senderSolanaPubkey, isSigner: false, isWritable: true },
    // receiver token account
    { pubkey: recipeintPubkey, isSigner: false, isWritable: true },
    // Bank token account authority (PDA of the userbank program)
    { pubkey: generatedProgramPDA, isSigner: false, isWritable: false },
    // spl token account
    {
      pubkey: tokenProgramKey,
      isSigner: false,
      isWritable: false
    },
    // sysvar instruction id
    {
      pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
      isSigner: false,
      isWritable: false
    }
  ]

  // const instr = new TransactionInstruction({
  //   keys: accounts,
  //   programId: audiusProgramPubkey,
  //   data: Buffer.from(serializedInstructionEnum)
  // })

  // eth pubkey is different from the ethAddress - addresses are len 20, pub keys are len 64
  const ethPubkey = secp256k1.publicKeyCreate(ethPrivateKeyArr, false).slice(1)
  // this particular program expects there to be an secp recovery instruction
  // prior to the claim instruction, so make it and add it
  // const secpInstruction = Secp256k1Program.createInstructionWithPublicKey({
  //   publicKey: ethPubkey,
  //   message: recipeintPubkey.toBytes(),
  //   signature: signatureObj.signature,
  //   recoveryId: signatureObj.recid
  // })
  console.log({ ethPubkey })
  const { blockhash } = await connection.getRecentBlockhash()

  const transactionData = {
    recentBlockhash: blockhash,
    secpInstruction: {
      publicKey: Buffer.from(ethPubkey),
      message: recipeintPubkey.toString(),
      signature: Buffer.from(signatureObj.signature),
      recoveryId: signatureObj.recid
    },
    instruction: {
      keys: accounts.map(account => {
        return {
          pubkey: account.pubkey.toString(),
          isSigner: account.isSigner,
          isWritable: account.isWritable
        }
      }),
      programId: audiusProgramPubkey.toString(),
      data: Buffer.from(serializedInstructionEnum)
    }
  }

  const response = await SolanaClient.relay(transactionData)
  console.log({ response })

  // send transferData to the identity relay
  // transferData
}

export default transferWAudioBalance
