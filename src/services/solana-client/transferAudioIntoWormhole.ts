/**
 * Transfer AUDIO to WAUDIO
 */

const amount = 100000

// transferWAudioBalance transfers wrapped Audio from one generated solana account to another.
// For it to work, you have to have the eth private key belonging to the eth public key
// that generated the solana account
export async function transferAudioIntoWormhole() {
  // NOTE: Relies on update in libs - linked libs for dev
  // The tokens will be sent to the solana derived bank account.
  // @ts-ignore
  const res = await window.audiusLibs.Account.permitAndSendTokens(
    '0xf92cD566Ea4864356C5491c177A430C222d7e678',
    amount
  )
  console.log({ res })
  return res
}

export default transferAudioIntoWormhole
