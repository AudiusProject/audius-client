import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'

import { solanaNFTToCollectible } from 'containers/collectibles/solCollectibleHelpers'
import { CollectibleState } from 'containers/collectibles/types'

import { SolanaNFT } from './types'

const SOLANA_CLUSTER_ENDPOINT = process.env.REACT_APP_SOLANA_CLUSTER_ENDPOINT

const METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
)

class SolanaClient {
  private connection = new Connection(SOLANA_CLUSTER_ENDPOINT!, 'confirmed')

  async getAllCollectibles(wallets: string[]): Promise<CollectibleState> {
    const tokenAccountsByOwnerAddress = await Promise.all(
      wallets.map(async address =>
        client.connection.getParsedTokenAccountsByOwner(
          new PublicKey(address),
          {
            programId: TOKEN_PROGRAM_ID
          }
        )
      )
    )

    const likelyNFTsByOwnerAddress = tokenAccountsByOwnerAddress
      .map(ta => ta.value)
      // value is an array of parsed token info
      .map((value, i) => {
        const ownerAddress = wallets[i]
        const mintAddresses = value
          .map(v => ({
            mint: v.account.data.parsed.info.mint,
            tokenAmount: v.account.data.parsed.info.tokenAmount
          }))
          .filter(({ tokenAmount }) => {
            // nfts generally have a supply of 1 and they have 0 decimal places
            // return tokenAmount.uiAmount === 1 && tokenAmount.decimals === 0
            return true
          })
          .map(({ mint }) => mint)
        /**
         * {
         *   mintAddresses: ['mintAddress1', 'mintAddress2', ...],
         *   ownerAddress: 'solanaAddress'
         * }
         */
        // console.log({ mintAddresses, ownerAddress })
        return { mintAddresses, ownerAddress }
      })

    const nfts = await Promise.all(
      likelyNFTsByOwnerAddress.map(async ({ mintAddresses }) => {
        const programAddresses = await Promise.all(
          mintAddresses.map(
            async mintAddress =>
              (
                await PublicKey.findProgramAddress(
                  [
                    Buffer.from('metadata'),
                    METADATA_PROGRAM_ID.toBytes(),
                    new PublicKey(mintAddress).toBytes()
                  ],
                  METADATA_PROGRAM_ID
                )
              )[0]
          )
        )
        const accountInfos = await Promise.all(
          programAddresses.map(async pa => {
            try {
              return await client.connection.getMultipleAccountsInfo([pa])
            } catch (error) {
              return null
            }
          })
        )
        const nonNullRes = accountInfos.filter(Boolean)
        const urls = nonNullRes
          .map(x => client._utf8ArrayToUrl(x![0].data))
          .filter(Boolean)
        const results = await Promise.all(
          urls.map(async url =>
            // @ts-ignore
            fetch(url)
              // @ts-ignore
              .then(res => res.json())
              .catch(() => null)
          )
        )
        return results.map(r => r as SolanaNFT).filter(Boolean)
      })
    )

    const solanaCollectibles = await Promise.all(
      nfts.map(async (collectiblesForAddress, i) => {
        const collectibles = await Promise.all(
          collectiblesForAddress.map(
            async c => await solanaNFTToCollectible(c, wallets[i])
          )
        )
        return collectibles
      })
    )

    return solanaCollectibles.reduce(
      (result, collectibles, i) => ({
        ...result,
        [wallets[i]]: collectibles
      }),
      {} as CollectibleState
    )
  }

  _utf8ArrayToUrl(array: Uint8Array) {
    const str = new TextDecoder().decode(array)
    const query = 'https://'
    const startIndex = str.indexOf(query)
    if (startIndex === -1) {
      return null
    }
    const endIndex = str.indexOf('/', startIndex + query.length)
    if (endIndex === -1) {
      return null
    }
    const url = str.substring(startIndex, endIndex + 44)
    return url
  }
}

const client = new SolanaClient()

export default client
