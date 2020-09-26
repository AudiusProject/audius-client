import { ID } from './common/Identifiers'

export enum FavoriteType {
  TRACK = 'track',
  PLAYLIST = 'playlist'
}

type Favorite = {
  save_item_id: ID
  save_type: FavoriteType
  user_id: number
}

export default Favorite
