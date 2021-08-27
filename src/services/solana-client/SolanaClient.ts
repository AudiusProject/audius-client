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

  /**
   * for each given wallet:
   * - get and parse its token accounts to get the mint addresses
   * - filter out tokens whose decimal places are not 0
   * - find the metadata PDAs for the mint addresses
   * - get the account infos for the PDAs if they exist
   * - get the metadata urls from the account infos and fetch the metadatas
   * - transform the nft metadatas to Audius-domain collectibles
   */
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

    const potentialNFTsByOwnerAddress = tokenAccountsByOwnerAddress
      .map(ta => ta.value)
      // value is an array of parsed token info
      .map((value, i) => {
        const mintAddresses = value
          .map(v => ({
            mint: v.account.data.parsed.info.mint,
            tokenAmount: v.account.data.parsed.info.tokenAmount
          }))
          .filter(({ tokenAmount }) => {
            // nfts generally have 0 decimal places
            return tokenAmount.decimals === 0
          })
          .map(({ mint }) => mint)
        return { mintAddresses }
      })

    const nfts = await Promise.all(
      potentialNFTsByOwnerAddress.map(async ({ mintAddresses }) => {
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
            fetch(url!)
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
    // https://github.com/metaplex-foundation/metaplex/blob/81023eb3e52c31b605e1dcf2eb1e7425153600cd/js/packages/web/src/contexts/meta/processMetaData.ts#L29
    const isArweave = str.includes('arweave')
    const query = 'https://'
    const startIndex = str.indexOf(query)
    if (!isArweave || startIndex === -1) {
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
