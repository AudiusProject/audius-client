import { ID } from 'models/common/Identifiers'
import { LineupState } from 'models/common/Lineup'

export default interface TrackPageState {
  trackId: ID | null
  rank: {
    week: number | null
    month: number | null
    year: number | null
  }
  trendingTrackRanks: {
    week: ID[] | null
    month: ID[] | null
    year: ID[] | null
  }
  tracks: LineupState<{ id: ID }>
}
