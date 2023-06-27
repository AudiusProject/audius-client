import { h } from "preact";
import { Helmet } from "react-helmet";
import { getHash } from "./collectibleHelpers";

const CollectibleHelmet = ({ collectiblesInfo }) => {
  console.log({ collectiblesInfo })
  if (!collectiblesInfo) {
        return null
    }
  const { collectible, user } = collectiblesInfo
  const title = `${collectible.name ? `${collectible.name} • ` : ''}NFT COLLECTIBLES • Audius`
  const description = collectible.description || (collectible.name ? `Check out ${collectible.name} on Audius · NFT COLLECTIBLES` : 'Check out NFT collectibles on Audius')
  const url = `https://audius.co/${user.handle}/collectibles/${getHash(collectible.id)}`
  let type 
  switch (collectible.mediaType) {
    case 'IMAGE':
    case 'GIF':
        type = 'ImageObject'
        break
    case 'VIDEO':
        type = 'VideoObject'
        break
    case 'THREE_D':
        type = '3DModel'
        break            
    default:
        type = 'MediaObject'
  }
  const structuredData = {
    "@context": "http://schema.googleapis.com/",
    "@type": type,
    "@id": url,
    url: url,
    name: collectible.name || 'NFT Collectible',
    description: description,
  }

  return (
    <Helmet encodeSpecialCharacters={false}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  )
}

export default CollectibleHelmet
