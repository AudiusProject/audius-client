import {
  Account,
  AccountMeta,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js'
import bs58 from 'bs58'
import BN from 'bn.js'
import {
  solanaClusterEndpoint,
  mintKey,
  tokenProgramKey,
  audiusProgramPubkey,
  generatedProgramPDA
} from './config'
import SolanaClient from './index'

export const getBankAccountAddress = async (ethAddress: string) => {
  const baseAccount = generatedProgramPDA

  // Solana client likes eth addresses as an array of uints
  const rawEthAddress = new BN(ethAddress, 'hex')

  // We b58 encode our eth address to use as seed later on
  const b58EthAddress = bs58.encode(rawEthAddress.toArrayLike(Buffer))

  const accountToGenerate: PublicKey = await PublicKey.createWithSeed(
    /* from pubkey / base */ baseAccount,
    /* seed */ b58EthAddress,
    /* programId / owner */ tokenProgramKey
  )
  return accountToGenerate
}
const feePayerPrivateKey = Uint8Array.from(
  JSON.parse(process.env.REACT_APP_PRIVATE || '')
)
console.log({ feePayerPrivateKey })
// createUserBank deterministically creates a Solana wAudio token account
// from an ethAddress (without the '0x' prefix)
export async function createUserBankFrom(ethAddress: string) {
  // Solana client likes eth addresses as an array of uints
  const rawEthAddress = new BN(ethAddress, 'hex')
  console.log({ rawEthAddress })

  // We need to prepend a zero hero so rust knows which enum case we're dealing with
  // https://paulx.dev/blog/2021/01/14/programming-on-solana-an-introduction/
  const ethAddressInstruction = Buffer.from(
    Uint8Array.of(0, ...rawEthAddress.toArray('be'))
  )
  // We b58 encode our eth address to use as seed later on
  const b58EthAddress = bs58.encode(rawEthAddress.toArrayLike(Buffer))
  console.log({ ethAddressInstruction, b58EthAddress })

  // Assign the base account - this is the account that will
  // eventually own the created account, and is the program derived address
  // of our bank program
  //
  // we had to generate this once, and now it's hardcoded. generation code
  // left commented out below.
  const baseAccount = generatedProgramPDA
  console.log({ baseAccount })
  // @ts-ignore
  // const res = yield PublicKey.findProgramAddress(
  //   [mintKey.toBytes().slice(0, 32)],
  //   programPubkey
  // )
  // const baseAccount = res[0] as PublicKey

  const accountToGenerate: PublicKey = await getBankAccountAddress(ethAddress)

  console.log({ accountToGenerate })

  const feePayerAccount = new Account(feePayerPrivateKey)

  console.log({ feePayerAccount, pub: feePayerAccount.publicKey })

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

  const transactionData = {
    recentBlockhash: blockhash,
    instruction: {
      keys: accounts.map(account => {
        return {
          pubkey: account.pubkey.toString(),
          isSigner: account.isSigner,
          isWritable: account.isWritable
        }
      }),
      programId: audiusProgramPubkey.toString(),
      data: ethAddressInstruction
    }
  }

  const response = await SolanaClient.relay(transactionData)
  console.log({ response })
  return response
}

export default createUserBankFrom
