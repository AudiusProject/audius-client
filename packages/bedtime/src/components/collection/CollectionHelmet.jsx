import { h } from 'preact'
import { Helmet } from 'react-helmet'
import { getAudiusHostname } from '../../util/getEnv'

const CollectionHelmet = ({ collection }) => {
  if (!collection) {
    return null
  }

  const title = `${collection.playlist_name} by ${collection.user.name} • Audius`
  const description = `Listen on Audius: ${collection.playlist_name}`
  const hostname = getAudiusHostname()
  const url = `https://${hostname}${collection.permalink}`
  const isAlbum = collection.is_album
  let type = isAlbum ? 'MusicAlbum' : 'MusicPlaylist'
  const structuredData = {
    '@context': 'http://schema.googleapis.com/',
    '@type': type,
    '@id': url,
    url,
    name: collection.playlist_name,
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
