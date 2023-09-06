import type { CommonState, lineupSelectors, LineupTrack } from '@audius/common'
import type { SetOptional } from 'type-fest'

export type TrackMetadata = SetOptional<
  ReturnType<
    ReturnType<
      typeof lineupSelectors.makeGetTableMetadatas<LineupTrack, CommonState>
    >
  >['entries'][0],
  'uid' | 'kind' | 'id' | 'followeeReposts'
>

export type TracksMetadata = TrackMetadata[]
