import { all, call, put, take, takeEvery } from 'redux-saga/effects'
import {
  getBalance,
  setBalance,
  send,
  sendSucceeded,
  sendFailed,
  getAccountBalance,
  decreaseBalance,
  stringWeiToBN,
  weiToString,
  BNWei,
  getLocalBalanceDidChange
} from 'store/wallet/slice'
import { fetchAccountSucceeded } from 'store/account/reducer'
import walletClient from 'services/wallet-client/WalletClient'
import { select } from 'redux-saga-test-plan/matchers'
import { SETUP_BACKEND_SUCCEEDED } from 'store/backend/actions'
import { make } from 'store/analytics/actions'
import { Name } from 'services/analytics'
import { getAccountUser } from 'store/account/selectors'
import { fetchAssociatedWallets } from 'store/token-dashboard/slice'
import {
  Account,
  AccountMeta,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js'
import bs58 from 'bs58'
import BN from 'bn.js'

// TODO: handle errors
const errors = {
  rateLimitError: 'Please wait before trying again'
}

function* sendAsync({
  payload: { recipientWallet, amount }
}: ReturnType<typeof send>) {
  const account = yield select(getAccountUser)
  const weiBNAmount = stringWeiToBN(amount)
  const weiBNBalance: ReturnType<typeof getAccountBalance> = yield select(
    getAccountBalance
  )
  if (!weiBNBalance || !weiBNBalance.gte(weiBNAmount)) return
  try {
    yield put(
      make(Name.SEND_AUDIO_REQUEST, {
        from: account?.wallet,
        recipient: recipientWallet
      })
    )
    yield call(() => walletClient.sendTokens(recipientWallet, weiBNAmount))

    // Only decrease store balance if we haven't already changed
    const newBalance: ReturnType<typeof getAccountBalance> = yield select(
      getAccountBalance
    )
    if (newBalance?.eq(weiBNBalance)) {
      yield put(decreaseBalance({ amount }))
    }

    yield put(sendSucceeded())
    yield put(
      make(Name.SEND_AUDIO_SUCCESS, {
        from: account?.wallet,
        recipient: recipientWallet
      })
    )
  } catch (e) {
    const isRateLimit = e.message === errors.rateLimitError
    let errorText = e.message
    if (isRateLimit) {
      errorText =
        'If you’ve already sent $AUDIO today, please wait a day before trying again'
    }
    yield put(sendFailed({ error: errorText }))
    yield put(
      make(Name.SEND_AUDIO_FAILURE, {
        from: account?.wallet,
        recipient: recipientWallet,
        error: errorText
      })
    )
  }
}

function* getWalletBalanceAndWallets() {
  yield all([put(getBalance()), put(fetchAssociatedWallets())])
}

function* fetchBalanceAsync() {
  const account = yield select(getAccountUser)
  const localBalanceChange: ReturnType<typeof getLocalBalanceDidChange> = yield select(
    getLocalBalanceDidChange
  )
  const currentBalance: BNWei = yield call(() =>
    walletClient.getCurrentBalance(/* bustCache */ localBalanceChange)
  )
  const associatedWalletBalance: BNWei = yield call(() =>
    walletClient.getAssociatedWalletBalance(
      account.user_id,
      /* bustCache */ localBalanceChange
    )
  )
  const totalBalance = currentBalance.add(associatedWalletBalance) as BNWei
  yield put(
    setBalance({
      balance: weiToString(currentBalance),
      totalBalance: weiToString(totalBalance)
    })
  )
}

function* watchSend() {
  yield takeEvery(send.type, sendAsync)
}

function* watchGetBalance() {
  yield takeEvery(getBalance.type, fetchBalanceAsync)
}

function* testSolana() {
  // The eth address we want to convert from
  const hexEthAddress = '3bb028940b855E34FBCb69c54D638389b14881b2'
  // const hexEthAddress = 'c9D4B5727f7098F45ceF4AbfBc67bA53a714c247'
  // solana token program
  const tokenProgramId = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  // the token claim program
  const programAddress = '8a3KEEEXgWyeJcZr4G5Y8r19TdriEMziBSi2qSEJxT6z'
  const programPubkey = new PublicKey(programAddress)
  // the audio wormhole program
  const rawMintKey = 'CYzPVv1zB9RH6hRWRKprFoepdD8Y7Q5HefCqrybvetja'
  const mintKey = new PublicKey(rawMintKey)

  const rawEthAddress = new BN(hexEthAddress, 'hex')
  // https://paulx.dev/blog/2021/01/14/programming-on-solana-an-introduction/
  const ethAddressInstruction = Buffer.from(
    Uint8Array.of(0, ...rawEthAddress.toArray('be'))
  )
  const b58EthAddress = bs58.encode(rawEthAddress.toArrayLike(Buffer))

  // Create the PDA
  // @ts-ignore
  const res = yield PublicKey.findProgramAddress(
    [mintKey.toBytes().slice(0, 32)],
    programPubkey
  )
  const baseAccount = res[0] as PublicKey

  // the base account is the mint account pub key
  // In the rust program, we use sl_token:id() as the program_id
  const accountToGenerate: PublicKey = yield PublicKey.createWithSeed(
    /* from pubkey / base */ baseAccount,
    /* seed */ b58EthAddress,
    /* programId / owner */ new PublicKey(tokenProgramId)
  )

  // TODO: Add your fee payer priv key here
  const feePayerPrivKey = Uint8Array.from([])

  const feePayerAccount = new Account(feePayerPrivKey)
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
      pubkey: new PublicKey(tokenProgramId),
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

  const clusterEndpt = 'https://api.mainnet-beta.solana.com'
  const connection = new Connection(clusterEndpt)
  // @ts-ignore
  const { blockhash } = yield connection.getRecentBlockhash()
  const instr = new TransactionInstruction({
    keys: accounts,
    programId: programPubkey,
    data: ethAddressInstruction
  })

  const tx = new Transaction({ recentBlockhash: blockhash })
  tx.add(instr)
  tx.sign(feePayerAccount)
  console.log('Submitting solana txn')
  const r: string = yield sendAndConfirmTransaction(connection, tx, [
    feePayerAccount
  ])
  console.log({ r })
}

function* watchFetchAccountSucceeded() {
  try {
    yield all([take(fetchAccountSucceeded.type), take(SETUP_BACKEND_SUCCEEDED)])
    yield testSolana()
    yield getWalletBalanceAndWallets()
  } catch (err) {
    console.error(err)
  }
}

const sagas = () => {
  return [watchGetBalance, watchSend, watchFetchAccountSucceeded]
}

export default sagas
