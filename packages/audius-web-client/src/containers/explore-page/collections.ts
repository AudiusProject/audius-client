import { ReactNode } from 'react'
import { ExploreCollectionsVariant } from './store/types'

import {
  EXPLORE_LET_THEM_DJ_PAGE,
  EXPLORE_TOP_ALBUMS_PAGE,
  EXPLORE_TOP_PLAYLISTS_PAGE,
  exploreMoodPlaylistsPage
} from 'utils/route'

import { ReactComponent as IconExploreDJ } from 'assets/img/iconExploreDJ.svg'
import { ReactComponent as IconExploreTopAlbums } from 'assets/img/iconExploreTopAlbums.svg'
import { ReactComponent as IconExploreTopPlaylists } from 'assets/img/iconExploreTopPlaylists.svg'
import { ReactComponent as IconBLM } from 'assets/img/iconBLMGlyph.svg'

export type ExploreCollection = {
  variant: ExploreCollectionsVariant
  title: string
  subtitle?: string
  gradient: string
  shadow: string
  icon?: ReactNode
  link: string
}

export type ExploreMoodCollection = ExploreCollection & {
  emoji: string
  moods: string[]
}

export const LET_THEM_DJ: ExploreCollection = {
  variant: ExploreCollectionsVariant.LET_THEM_DJ,
  title: 'Let Them DJ',
  subtitle: 'Playlists created by the people you follow',
  gradient: 'linear-gradient(315deg, #08AEEA 0%, #2AF598 100%)',
  shadow: 'rgba(9,175,233,0.35)',
  icon: IconExploreDJ,
  link: EXPLORE_LET_THEM_DJ_PAGE
}

export const TOP_ALBUMS: ExploreCollection = {
  variant: ExploreCollectionsVariant.TOP_ALBUMS,
  title: 'Top Albums',
  subtitle: 'The top albums from all of Audius',
  gradient: 'linear-gradient(135deg, #FF00B6 0%, #B000FF 100%)',
  shadow: 'rgba(177,0,253,0.35)',
  icon: IconExploreTopAlbums,
  link: EXPLORE_TOP_ALBUMS_PAGE
}

export const TOP_PLAYLISTS: ExploreCollection = {
  variant: ExploreCollectionsVariant.TOP_PLAYLISTS,
  title: 'Top Playlists',
  subtitle: 'The top playlists on Audius right now',
  gradient: 'linear-gradient(315deg, #57ABFF 0%, #CD98FF 100%)',
  shadow: 'rgba(87,170,255,0.35)',
  icon: IconExploreTopPlaylists,
  link: EXPLORE_TOP_PLAYLISTS_PAGE
}

export const CHILL_PLAYLISTS: ExploreMoodCollection = {
  variant: ExploreCollectionsVariant.MOOD,
  title: 'Chill',
  emoji: 'dove-of-peace',
  gradient: 'linear-gradient(135deg, #2CD1FF 0%, #FA8BFF 100%)',
  shadow: 'rgba(237,144,255,0.35)',
  link: exploreMoodPlaylistsPage('chill'),
  moods: ['peaceful', 'easygoing', 'melancholy']
}

export const PROVOKING_PLAYLISTS: ExploreMoodCollection = {
  variant: ExploreCollectionsVariant.MOOD,
  title: 'Provoking',
  emoji: 'thinking-face',
  gradient: 'linear-gradient(135deg, #3FECF4 0%, #16A085 100%)',
  shadow: 'rgba(115,225,179,0.35)',
  link: exploreMoodPlaylistsPage('provoking'),
  moods: ['sophisticated', 'brooding', 'serious', 'stirring']
}

export const INTIMATE_PLAYLISTS: ExploreMoodCollection = {
  variant: ExploreCollectionsVariant.MOOD,
  title: 'Intimate',
  emoji: 'heart-with-arrow',
  gradient: 'linear-gradient(315deg, #F24FDF 0%, #C881FF 100%)',
  shadow: 'rgba(241,81,225,0.35)',
  link: exploreMoodPlaylistsPage('intimate'),
  moods: ['sentimental', 'romantic', 'yearning', 'sensual', 'tender']
}

export const UPBEAT_PLAYLISTS: ExploreMoodCollection = {
  variant: ExploreCollectionsVariant.MOOD,
  title: 'Upbeat',
  emoji: 'person-raising-both-hands-in-celebration',
  gradient: 'linear-gradient(135deg, #896BFF 0%, #0060FF 100%)',
  shadow: 'rgba(11,97,255,0.35)',
  link: exploreMoodPlaylistsPage('upbeat'),
  moods: ['upbeat', 'excited', 'energizing', 'empowering', 'cool']
}

export const INTENSE_PLAYLISTS: ExploreMoodCollection = {
  variant: ExploreCollectionsVariant.MOOD,
  title: 'Intense',
  emoji: 'fire',
  gradient: 'linear-gradient(315deg, #FBAB7E 0%, #F7CE68 100%)',
  shadow: 'rgba(250,173,124,0.35)',
  link: exploreMoodPlaylistsPage('intense'),
  moods: ['rowdy', 'fiery', 'defiant', 'aggressive', 'gritty']
}

export const EXPLORE_COLLECTIONS_MAP = {
  [ExploreCollectionsVariant.LET_THEM_DJ]: LET_THEM_DJ,
  [ExploreCollectionsVariant.TOP_ALBUMS]: TOP_ALBUMS,
  [ExploreCollectionsVariant.TOP_PLAYLISTS]: TOP_PLAYLISTS
}

type ExploreMoodMap = { [key in string]: ExploreMoodCollection }
export const EXPLORE_MOOD_COLLECTIONS_MAP: ExploreMoodMap = {
  chill: CHILL_PLAYLISTS,
  provoking: PROVOKING_PLAYLISTS,
  intimate: INTIMATE_PLAYLISTS,
  upbeat: UPBEAT_PLAYLISTS,
  intense: INTENSE_PLAYLISTS
}

export const BLACK_LIVES_MATTER: ExploreCollection = {
  variant: ExploreCollectionsVariant.DIRECT_LINK,
  title: 'Black Lives Matter',
  subtitle: '',
  gradient: ' linear-gradient(349.37deg, #333333 0.82%, #000000 99.02%)',
  shadow: 'rgba(0, 0, 0, 0.35)',
  icon: IconBLM,
  link: 'https://audius.co/audius/playlist/black-voices-8313'
}
