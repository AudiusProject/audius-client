import { h } from 'preact'
import { Helmet } from 'react-helmet'
import { getAudiusHostname } from '../../util/getEnv'
import { decodeHashId } from '../../util/hashids'

const CollectionHelmet = ({ collection }) => {
  if (!collection) {
    return null
  }

  const title = `${collection.playlistName} by ${collection.user.name} • Audius`
  const description = `Listen on Audius: ${collection.playlistName}`
  const hostname = getAudiusHostname()
  const url = `https://${hostname}${collection.permalink}-${decodeHashId(
    collection.id
  )}`
  const isAlbum = collection.isAlbum
  let type = isAlbum ? 'MusicAlbum' : 'MusicPlaylist'
  const structuredData = {
    '@context': 'http://schema.googleapis.com/',
    '@type': type,
    '@id': url,
    url,
    name: collection.playlistName,
    description
  }

  return (
    <Helmet encodeSpecialCharacters={false}>
      <title>{title}</title>
      <meta name='description' content={description} />
      <link rel='canonical' href={url} />
      <script type='application/ld+json'>
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  )
}

export default CollectionHelmet
