import { useState } from 'react'

import TrackPlayer, {
  useTrackPlayerEvents,
  Event
} from 'react-native-track-player'

export const useTrackPlayerDuration = () => {
  const [duration, setDuration] = useState(0)
  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackTrackChanged) {
      const newDuration = await TrackPlayer.getDuration()
      setDuration(newDuration)
    }
  })
  return duration
}
