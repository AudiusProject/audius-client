import {
  Account,
  AccountMeta,
  Connection,
  PublicKey,
  Secp256k1Program,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js'
import bs58 from 'bs58'
import BN from 'bn.js'
import * as borsh from 'borsh'
import keccak256 from 'keccak256'
import secp256k1 from 'secp256k1'

const solanaClusterEndpoint = 'https://api.mainnet-beta.solana.com'

// The wAudio mint. You can look this up on solana explorer
const mintAddress = 'CYzPVv1zB9RH6hRWRKprFoepdD8Y7Q5HefCqrybvetja'
const mintKey = new PublicKey(mintAddress)

// Native solana token program
const tokenProgramKey = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
)

// This is the generated program derived address we use so our
// bank program can take ownership of accounts
const generatedProgramPDA = new PublicKey(
  'Hi3B52uSJyDdbuQbwv6MgSrGLVUA5sZ7CHZjLHiNGJJv'
)

// TODO: fill this fee payer private key with a valid solana private key, an array of uints.
// Once you initialize one via solana cli you can just `cat ~/.config/solana/id.json`
const feePayerPrivateKey = Uint8Array.from([])

// The address of our deployed bank program
const audiusProgramAddress = '8a3KEEEXgWyeJcZr4G5Y8r19TdriEMziBSi2qSEJxT6z'
const audiusProgramPubkey = new PublicKey(audiusProgramAddress)

// createUserBank deterministically creates a Solana wAudio token account
// from an ethAddress (without the '0x' prefix)
export async function createUserBankFrom(ethAddress: string) {
  // Solana client likes eth addresses as an array of uints
  const rawEthAddress = new BN(ethAddress, 'hex')

  // We need to prepend a zero hero so rust knows which enum case we're dealing with
  // https://paulx.dev/blog/2021/01/14/programming-on-solana-an-introduction/
  const ethAddressInstruction = Buffer.from(
    Uint8Array.of(0, ...rawEthAddress.toArray('be'))
  )
  // We b58 encode our eth address to use as seed later on
  const b58EthAddress = bs58.encode(rawEthAddress.toArrayLike(Buffer))

  // Assign the base account - this is the account that will
  // eventually own the created account, and is the program derived address
  // of our bank program
  //
  // we had to generate this once, and now it's hardcoded. generation code
  // left commented out below.
  const baseAccount = generatedProgramPDA
  // @ts-ignore
  // const res = yield PublicKey.findProgramAddress(
  //   [mintKey.toBytes().slice(0, 32)],
  //   programPubkey
  // )
  // const baseAccount = res[0] as PublicKey

  const accountToGenerate: PublicKey = await PublicKey.createWithSeed(
    /* from pubkey / base */ baseAccount,
    /* seed */ b58EthAddress,
    /* programId / owner */ tokenProgramKey
  )

  const feePayerAccount = new Account(feePayerPrivateKey)

  // Keys, in order:
  // - funder (true)
  // - mint
  // - base acc
  // - acc_to_create
  // - spl_token_id
  // - rent:id()
  // - system_program:id()
  const accounts: AccountMeta[] = [
    // Funder
    {
      pubkey: feePayerAccount.publicKey,
      isWritable: true,
      isSigner: true
    },
    // Mint
    {
      pubkey: mintKey,
      isSigner: false,
      isWritable: false
    },
    // Base acct
    {
      pubkey: baseAccount,
      isSigner: false,
      isWritable: false
    },
    // Account to create
    {
      pubkey: accountToGenerate,
      isSigner: false,
      isWritable: true
    },
    // token program
    {
      pubkey: tokenProgramKey,
      isSigner: false,
      isWritable: false
    },
    // Rent program
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false
    },
    // system program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
  ]

  const connection = new Connection(solanaClusterEndpoint)
  const { blockhash } = await connection.getRecentBlockhash()

  const instr = new TransactionInstruction({
    keys: accounts,
    programId: audiusProgramPubkey,
    data: ethAddressInstruction
  })

  const tx = new Transaction({ recentBlockhash: blockhash })
  tx.add(instr)
  tx.sign(feePayerAccount)
  console.log('Submitting solana txn')

  console.time('gen_acct')
  // It returns the transaction ID
  const response: string = await sendAndConfirmTransaction(
    connection,
    tx,
    [feePayerAccount],
    {
      skipPreflight: true,
      commitment: 'processed',
      preflightCommitment: 'processed'
    }
  )
  console.timeEnd('gen_acct')

  console.log('got solana response')
  console.log(response)

  return response
}

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

// transferFrom transfers wrapped Audio from one generated solana account to another.
// For it to work, you have to have the eth private key belonging to the eth public key
// that generated the solana account
export async function transferFrom(
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

  const instr = new TransactionInstruction({
    keys: accounts,
    programId: audiusProgramPubkey,
    data: Buffer.from(serializedInstructionEnum)
  })

  // eth pubkey is different from the ethAddress - addresses are len 20, pub keys are len 64
  const ethPubkey = secp256k1.publicKeyCreate(ethPrivateKeyArr, false).slice(1)
  // this particular program expects there to be an secp recovery instruction
  // prior to the claim instruction, so make it and add it
  const secpInstruction = Secp256k1Program.createInstructionWithPublicKey({
    publicKey: ethPubkey,
    message: recipeintPubkey.toBytes(),
    signature: signatureObj.signature,
    recoveryId: signatureObj.recid
  })

  const { blockhash } = await connection.getRecentBlockhash()
  const tx = new Transaction({ recentBlockhash: blockhash })

  tx.add(secpInstruction)
  tx.add(instr)

  const feePayerAccount = new Account(feePayerPrivateKey)
  tx.sign(feePayerAccount)

  console.log('Submitting solana txn')
  console.time('solana txn')
  const response: string = await sendAndConfirmTransaction(
    connection,
    tx,
    [feePayerAccount],
    {
      skipPreflight: true,
      commitment: 'processed',
      preflightCommitment: 'processed'
    }
  )
  console.timeEnd('solana txn')
  return response
}
