import { h } from "preact"
import { Helmet } from "react-helmet"
import { getAudiusHostname } from "../../util/getEnv"

const CollectionHelmet = ({ collection }) => {
  if (!collection) {
    return null
  }

  const title = `${collection.name} by ${collection.ownerName} • Audius`
  const description = `Listen on Audius: ${collection.name}`
  const hostname = getAudiusHostname()
  const url = `https://${hostname}/${collection.collectionURLPath}`
  const isAlbum = collectionURLPath.toLowerCase().includes('album')
  let type = isAlbum ? 'MusicAlbum' : 'MusicPlaylist'
  const structuredData = {
    "@context": "http://schema.googleapis.com/",
    "@type": type,
    "@id": url,
    url: url,
    name: collection.name,
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

export default CollectionHelmet
