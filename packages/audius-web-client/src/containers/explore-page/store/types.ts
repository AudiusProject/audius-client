import { ID } from 'models/common/Identifiers'
import { Status } from 'store/types'

export enum Tabs {
  FOR_YOU = 'FOR YOU',
  MOODS = 'MOODS',
  PLAYLISTS = 'PLAYLISTS',
  PROFILES = 'PROFILES'
}

export type ExploreContent = {
  featuredPlaylists: ID[]
  featuredProfiles: ID[]
}

export default interface ExplorePageState {
  status: Status
  playlists: ID[]
  profiles: ID[]
}

export enum ExploreCollectionsVariant {
  LET_THEM_DJ = 'Let Them DJ',
  TOP_ALBUMS = 'Top Albums',
  TOP_PLAYLISTS = 'Top Playlists',
  MOOD = 'Mood',
  DIRECT_LINK = 'Direct Link'
}
