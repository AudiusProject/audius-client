export type JupiterTokenListing = {
  chainId: number // 101,
  address: string // 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  symbol: string // 'USDC',
  name: string // 'Wrapped USDC',
  decimals: number // 6,
  logoURI: string // 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png',
}

export const TOKEN_LISTING_MAP: Record<string, JupiterTokenListing> = {
  AUDIO: {
    chainId: 101,
    address: '9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM',
    symbol: 'AUDIO',
    name: 'Audius (Portal)',
    decimals: 8,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM/logo.png'
  },
  SOL: {
    chainId: 101,
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Wrapped SOL',
    decimals: 9,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },

  USDC: {
    chainId: 101,
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  }
}
export type JupiterTokenSymbol = keyof typeof TOKEN_LISTING_MAP
