import Cache from 'models/common/Cache'
import Track from 'models/Track'

interface TracksCacheState extends Cache<Track> {
  permalinks: { [permalink: string]: { id: number } }
}

export default TracksCacheState
