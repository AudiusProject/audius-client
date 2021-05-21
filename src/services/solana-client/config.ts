import { PublicKey } from '@solana/web3.js'

// TODO: Put all values in env var - but also figure out staging

export const solanaClusterEndpoint = 'https://api.mainnet-beta.solana.com'

// The wAudio mint. You can look this up on solana explorer
export const mintAddress = 'CYzPVv1zB9RH6hRWRKprFoepdD8Y7Q5HefCqrybvetja'
export const mintKey = new PublicKey(mintAddress)

// Native solana token program
export const tokenProgramKey = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
)

// This is the generated program derived address we use so our
// bank program can take ownership of accounts
export const generatedProgramPDA = new PublicKey(
  'Hi3B52uSJyDdbuQbwv6MgSrGLVUA5sZ7CHZjLHiNGJJv'
)

// TODO: fill this fee payer private key with a valid solana private key, an array of uints.
// Once you initialize one via solana cli you can just `cat ~/.config/solana/id.json`
export const feePayerPublicKey =
  process.env.REACT_APP_SOLANA_FEE_PAYER_PLUBLIC_KEY

// The address of our deployed bank program
export const audiusProgramAddress =
  '8a3KEEEXgWyeJcZr4G5Y8r19TdriEMziBSi2qSEJxT6z'
export const audiusProgramPubkey = new PublicKey(audiusProgramAddress)
