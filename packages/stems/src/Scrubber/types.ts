type ScrubberProps = {
  isPlaying: boolean
  isDisabled: boolean

  elapsedSeconds: number
  totalSeconds: number

  onScrubStart?: () => void
  onScrubRelease?: () => void
}

export default ScrubberProps
