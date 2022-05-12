import { User } from './User'
import { StringWei } from './Wallet'

export type Supporter = {
  sender: User
  amount: StringWei
  rank: number
}

export type Supporting = {
  receiver: User
  amount: StringWei
  rank: number
}
