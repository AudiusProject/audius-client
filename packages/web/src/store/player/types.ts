import { Nullable, TrackSegment } from '@audius/common'

export type Info = {
  id: string
  title: string
  artist: string
  artwork?: string
}

export type Audio = {
  load: (
    segments: TrackSegment[],
    onEnd: () => void,
    prefetchedSegments: string[],
    gateways: string[],
    info: Info,
    forceStreamSrc?: Nullable<string>
  ) => void
  play: () => void
  pause: () => void
  stop: () => void
  seek: (seconds: number) => void
  setVolume: (volume: number) => void
  isBuffering: () => boolean
  getPosition: () => number | Promise<number>
  getDuration: () => number
}

export type TAudio = {
  new (): Audio
}
