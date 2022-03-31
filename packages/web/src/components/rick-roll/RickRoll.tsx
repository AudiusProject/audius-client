import React from 'react'

import { useSelector } from 'react-redux'

import { getIsPlaying } from 'store/rick-roll/selectors'

export const RickRoll = () => {
  const isPlaying = useSelector(getIsPlaying)
  return isPlaying ? (
    <iframe
      width='0'
      height='0'
      src='https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
      title='YouTube video player'
      frameBorder='0'
      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      allowFullScreen
    ></iframe>
  ) : null
}
