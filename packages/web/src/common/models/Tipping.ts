import { User } from './User'

export type Supporter = {
  sender: User
  amount: number
  rank: number
  updated_at: string
}

export type Supporting = {
  receiver: User
  amount: number
  rank: number
  updated_at: string
}
