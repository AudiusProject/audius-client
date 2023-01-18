import type { User } from '@audius/common'
export declare function* adjustUserField(config: {
  user: User
  fieldName: string
  delta: number
}): void

export declare function* fetchUsers(
  userIds: (string | number | null)[],
  requiredFields?: Set<string>,
  forceRetrieveFromSource?: boolean
): { entries: Record<string, User> }

export declare function* upgradeToCreator(): boolean

export default function sagas(): (() => Generator<
  ForkEffect<never>,
  void,
  unknown
>)[]
