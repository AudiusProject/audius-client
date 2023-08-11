import React from 'react'

import { Genre, Mood } from '@audius/sdk'

import { audiusSdk } from 'services/audius-sdk'

export const TestSdk = () => {
  const coverArtRef = React.useRef<HTMLInputElement>(null)
  const trackRef = React.useRef<HTMLInputElement>(null)

  const handleClick = async () => {
    const coverArtFile = coverArtRef.current?.files?.[0]
    const trackFile = trackRef.current?.files?.[0]

    if (!coverArtFile || !trackFile) return

    const { trackId } = await (
      await audiusSdk()
    ).tracks.uploadTrack({
      userId: '7eP5n',
      coverArtFile,
      metadata: {
        title: 'Monstera',
        description: 'Dedicated to my favorite plant',
        genre: Genre.METAL,
        mood: Mood.AGGRESSIVE
      },
      trackFile
    })

    console.log(trackId)
  }
  return (
    <>
      <input type='file' ref={coverArtRef} />
      <input type='file' ref={trackRef} />
      <button onClick={handleClick}>Click me</button>
    </>
  )
}
