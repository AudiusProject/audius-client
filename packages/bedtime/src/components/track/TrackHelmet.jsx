import { h } from "preact";
import { Helmet } from "react-helmet";

const TrackHelmet = ({ track }) => {
  if (!track) {
    return null;
  }

  const title = `${track.title} by ${track.userName} • Audius`;
  const description = `Listen to ${track.title} on Audius. ${track.userName} · Song`;
  const hostname = getAudiusHostname()
  const url = `https://${hostname}/${track.urlPath}`;
  const structuredData = {
    "@context": "http://schema.googleapis.com/",
    "@type": "MusicRecording",
    "@id": url,
    url: url,
    name: track.title,
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
  );
};

export default TrackHelmet;
