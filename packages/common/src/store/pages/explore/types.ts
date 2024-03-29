import { ID, Status } from '../../../models'

export enum ExplorePageTabs {
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
  playlistsStatus: Status
  profiles: ID[]
  profilesStatus: Status
  tab: ExplorePageTabs
}

export enum ExploreCollectionsVariant {
  LET_THEM_DJ = 'Let Them DJ',
  TOP_ALBUMS = 'Top Albums',
  MOOD = 'Mood',
  DIRECT_LINK = 'Direct Link'
}
