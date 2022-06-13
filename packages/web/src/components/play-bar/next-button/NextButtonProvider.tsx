import { useSelector } from 'react-redux'

import { Genre } from 'common/utils/genres'
import { makeGetCurrent } from 'store/player/selectors'

import ForwardSkipButton, { ForwardSkipButtonProps } from './ForwardSkipButton'
import NextButton, { NextButtonProps } from './NextButton'

type NextButtonProviderProps = NextButtonProps | ForwardSkipButtonProps

const NextButtonProvider = (props: NextButtonProviderProps) => {
  const { track } = useSelector(makeGetCurrent())
  const isPodcast = track && track.genre === Genre.PODCASTS
  return isPodcast ? (
    <ForwardSkipButton {...props} />
  ) : (
    <NextButton {...props} />
  )
}

export default NextButtonProvider
