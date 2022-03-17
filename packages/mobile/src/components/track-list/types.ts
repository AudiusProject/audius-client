import { makeGetTableMetadatas } from 'audius-client/src/common/store/lineup/selectors'
export type TrackMetadataLineup = ReturnType<
  ReturnType<typeof makeGetTableMetadatas>
>
export type TrackMetadata = TrackMetadataLineup['entries'][0]
