import { Status, Cache, User } from '../../../models/index'

export interface UsersCacheState extends Cache<User> {
  handles: { [handle: string]: { id: number; status: Status } }
}
