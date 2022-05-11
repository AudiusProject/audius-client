import { User } from './User'
import { StringWei } from './Wallet'

export type Supporter = {
  sender: User
  amount: StringWei
  rank: number
  updated_at: string
}

export type Supporting = {
  receiver: User
  amount: StringWei
  rank: number
  updated_at: string
}
