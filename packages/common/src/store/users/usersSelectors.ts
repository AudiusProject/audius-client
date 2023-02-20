import { zipObject } from 'lodash'

import { ID } from 'models/Identifiers'
import { User } from 'models/User'
import { Nullable, removeNullable } from 'utils/typeUtils'

import { CommonState } from '..'

import { usersAdapter } from './usersSlice'

export const {
  selectById: selectUserById,
  selectIds: selectUserIds,
  selectEntities: selectUserEntities,
  selectAll: selectAllUsers,
  selectTotal: selectTotalUsers
} = usersAdapter.getSelectors<CommonState>((state) => state.users)

export const getUser = (
  state: CommonState,
  props: { handle?: Nullable<string>; id?: Nullable<ID> }
) => {
  if (props.id) {
    return selectUserById(state, props.id) ?? null
  } else if (props.handle) {
    const userId = state.users.handles[props.handle.toLowerCase()]
    if (userId) {
      return selectUserById(state, userId) ?? null
    }
  }
  return null
}

export function getUsers(state: CommonState): User[]
export function getUsers(
  state: CommonState,
  props: { ids?: ID[]; handles?: string[] }
): User[]
export function getUsers(
  state: CommonState,
  props?: { ids?: ID[]; handles?: string[] }
) {
  if (props?.ids) {
    const users: { [id: number]: User } = {}
    for (const id of props.ids) {
      const user = getUser(state, { id })
      if (user) {
        users[user.user_id] = user
      }
    }
    return users
  }
  if (props?.handles) {
    const users: { [handle: string]: User } = {}
    for (const handle of props.handles) {
      const user = getUser(state, { handle })
      if (user) {
        users[handle] = user
      }
    }
    return users
  }

  return selectUserEntities(state) as { [id: number]: User }
}

export const getUserTimestamps = (
  state: CommonState,
  props: { ids?: ID[]; handles?: string[] }
) => {
  if (props.ids) {
    return zipObject(
      props.ids,
      props.ids.map((id) => state.users.timestamps[id])
    )
  } else if (props.handles) {
    const userIds = props.handles
      .map((handle) => state.users.handles[handle.toLowerCase()])
      .filter(removeNullable)

    return zipObject(
      props.handles,
      userIds.map((id) => state.users.timestamps[id])
    )
  }
  return state.users.timestamps
}

export const usersSelectors = {
  getUser,
  getUsers,
  getUserTimestamps,
  selectUserById,
  selectUserIds,
  selectUserEntities,
  selectAllUsers,
  selectTotalUsers
}
