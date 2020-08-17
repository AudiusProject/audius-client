import Cache from 'models/common/Cache'
import User from 'models/User'
import { Status } from 'store/types'

interface UsersCacheState extends Cache<User> {
  handles: { [handle: string]: { id: number; status: Status } }
}

export default UsersCacheState
