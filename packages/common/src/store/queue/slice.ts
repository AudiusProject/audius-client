import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { findLastIndex } from 'lodash'

import { RepeatMode, Queueable, QueueSource } from 'store/queue/types'

import { ID, UID, Collectible } from '../../models'
import { Maybe, Nullable } from '../../utils'

type State = {
  order: Queueable[]

  // Maps track UIDs to the index
  positions: { [uid: string]: number }
  //
  userQueuePositions: { [uid: string]: number }

  // Active index
  index: number

  repeat: RepeatMode

  shuffle: boolean
  shuffleIndex: number
  // Ordering of the indexes of the queue to shuffle through
  shuffleOrder: number[]

  queueAutoplay: boolean

  // Whether or not a `next` was fired on the queue that overshoots
  // the length of the queue (`next` from the last track).
  // Reset to false on the next play.
  overshot: boolean

  // Whether or not a `previous` was fired on the queue that undershoots
  // the length of the queue (`previous` from the first track).
  // Reset to false on the next play.
  undershot: boolean
}

export const initialState: State = {
  order: [],
  positions: {},
  userQueuePositions: {},
  index: -1,
  repeat: RepeatMode.OFF,
  shuffle: false,
  shuffleIndex: -1,
  shuffleOrder: [],
  queueAutoplay: true,
  overshot: false,
  undershot: false
}

type PlayPayload = {
  uid?: Nullable<UID>
  trackId?: Nullable<ID>
  collectible?: Collectible
  source?: Nullable<string>
}

type QueueAutoplayPayload = {
  genre: string
  exclusionList: number[]
  currentUserId: Nullable<ID>
}

type PausePayload = {}

type NextPayload = Maybe<{
  // Whether or not to skip if in repeat mode (passive vs. active next)
  skip?: boolean
}>

type PreviousPayload = undefined

type UpdateIndexPayload = {
  index: number
}

type RepeatPayload = {
  mode: RepeatMode
}

type ShufflePayload = {
  enable: boolean
}

type ReorderPayload = {
  orderedUids: UID[]
}

type ClearPayload = {}

type AddPayload = {
  entries: Queueable[]
  // Index to insert at
  index?: number
}

type UserAddToQueuePayload = {
  entries: Queueable[]
}

type UserClearOwnQueuePayload = {}

type RemovePayload = {
  uid: UID
}

const calculateNewPositions = (
  oldPositions: { [uid: string]: number },
  newEntriesStartIndex: number,
  newEntries: Queueable[],
  excludeAddedPositions?: boolean
) => {
  const addedPositions = newEntries.reduce((mapping, entry, i) => {
    mapping[entry.uid ?? entry.id] = newEntriesStartIndex + i
    return mapping
  }, {} as { [uid: string]: number })
  console.log('addedPositions', addedPositions)
  const res = Object.keys(oldPositions).reduce(
    (updated, uid) => {
      if (oldPositions[uid] >= newEntriesStartIndex) {
        updated[uid] = oldPositions[uid] + newEntries.length
      } else {
        updated[uid] = oldPositions[uid]
      }
      return updated
    },
    excludeAddedPositions ? {} : addedPositions
  )
  console.log(res)
  return res
}

const calculateNewShuffleOrder = (
  newOrder: Queueable[],
  userQueueEndIndex: number // Exclusive
) => {
  return [
    ...(userQueueEndIndex > 0 ? newOrder.slice(0, userQueueEndIndex) : []).map(
      Number.call,
      Number
    ),
    ...newOrder
      .slice(userQueueEndIndex)
      .map(Number.call, Number)
      .sort(() => Math.random() - 0.5)
  ] as number[]
}

// Find the last user-enqueued entry after
const getUserQueueEndIndex = (state: State) => {
  const found = findLastIndex(
    state.order,
    ({ source }, index) =>
      source === QueueSource.USER_ADDED || index === state.index
  )

  return found + 1
}

const slice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    // Play the queue, either resuming or playing a new uid if provided */
    play: (state, action: PayloadAction<PlayPayload>) => {
      const { collectible, uid } = action.payload
      let newIndex

      if (uid) {
        if (
          state.order[state.index] &&
          state.order[state.index].source === QueueSource.USER_ADDED
        ) {
          newIndex = state.userQueuePositions[uid]
        } else {
          newIndex = state.positions[uid]
        }
      } else if (collectible) {
        newIndex = state.positions[collectible.id]
      }

      state.index = newIndex ?? state.index
      state.overshot = false
      state.undershot = false
    },
    queueAutoplay: (_state, _action: PayloadAction<QueueAutoplayPayload>) => {},
    // Pauses the queue
    pause: (_state, _action: PayloadAction<PausePayload>) => {},
    // Skips the next track in the queue
    next: (state, action: PayloadAction<NextPayload>) => {
      const skip = action.payload?.skip

      if (state.order.length === 0) return

      if (state.repeat === RepeatMode.SINGLE && !skip) {
        return
      }

      if (state.shuffle) {
        const newShuffleIndex =
          (state.shuffleIndex + 1) % state.shuffleOrder.length

        state.shuffleIndex = newShuffleIndex
        state.index = state.shuffleOrder[newShuffleIndex]
        return
      }

      // Next on end of queue
      if (state.index + 1 >= state.order.length) {
        if (state.repeat === RepeatMode.ALL) {
          // Repeat
          state.index = 0
          return
        }
        if (!state.queueAutoplay) {
          // Reset to last track
          state.overshot = true
          return
        }
      }

      state.index = state.index + 1
    },
    // Skips to the previous track in the queue
    previous: (state, _action: PayloadAction<PreviousPayload>) => {
      if (state.shuffle) {
        const newShuffleIndex =
          state.shuffleIndex - 1 < 0
            ? state.shuffleIndex - 1 + state.shuffleOrder.length
            : state.shuffleIndex - 1
        state.shuffleIndex = newShuffleIndex
        state.index = state.shuffleOrder[newShuffleIndex]
        return
      }

      const prevIndex = state.index - 1
      // Previous on beginning of queue
      if (prevIndex < 0) {
        state.undershot = true
        return
      }

      state.index = prevIndex
    },
    // Updates the queue's index to a given value. Useful when the queue
    // is paused, but we would like to resume playback later from somewhere else.
    updateIndex: (state, action: PayloadAction<UpdateIndexPayload>) => {
      const { index } = action.payload
      state.index = index
    },
    // Changes the queue's repeat mode
    repeat: (state, action: PayloadAction<RepeatPayload>) => {
      const { mode } = action.payload
      state.repeat = mode
    },
    // Changes the queue's shuffle mode
    shuffle: (state, action: PayloadAction<ShufflePayload>) => {
      const { enable } = action.payload
      state.shuffle = enable
    },
    // Reorders the queue to the provided order
    reorder: (state, action: PayloadAction<ReorderPayload>) => {
      const { orderedUids } = action.payload

      const newOrder = orderedUids.map(
        (uid) => state.order[state.positions[uid]]
      )

      const newPositions = orderedUids.reduce((m, uid, i) => {
        m[uid] = i
        return m
      }, {} as { [uid: string]: number })

      const newIndex =
        state.index >= 0 ? newPositions[state.order[state.index].uid] : -1

      state.order = newOrder
      state.positions = newPositions
      state.index = newIndex
    },
    userAddToPlayNext: (
      state,
      action: PayloadAction<UserAddToQueuePayload>
    ) => {
      const { entries } = action.payload
      const insertIndex = state.index + 1
      const newOrder = [...state.order]
      newOrder.splice(insertIndex, 0, ...entries)

      const newPositions = calculateNewPositions(
        state.positions,
        insertIndex,
        entries,
        true
      )

      const addedPositions = calculateNewPositions(
        state.userQueuePositions,
        insertIndex,
        entries
      )

      // Don't shuffle user-enqueued songs
      const newShuffleOrder = calculateNewShuffleOrder(
        newOrder,
        insertIndex + entries.length
      )

      state.order = newOrder
      state.positions = newPositions
      state.shuffleOrder = newShuffleOrder
      state.userQueuePositions = addedPositions
    },
    // Adds a track to the user's queue (which comes before tracks added by us)
    userAddToQueue: (state, action: PayloadAction<UserAddToQueuePayload>) => {
      const { entries } = action.payload
      console.log('hi entries', entries)
      const insertIndex = getUserQueueEndIndex(state)
      const newOrder = [...state.order]
      newOrder.splice(insertIndex, 0, ...entries)

      const newPositions = calculateNewPositions(
        state.positions,
        insertIndex,
        entries,
        true
      )

      const addedPositions = {
        ...state.userQueuePositions,
        ...entries.reduce((mapping, entry, i) => {
          mapping[entry.uid ?? entry.id] = insertIndex + i
          return mapping
        }, {} as { [uid: string]: number })
      }

      // Don't shuffle user-enqueued songs
      const newShuffleOrder = calculateNewShuffleOrder(
        newOrder,
        insertIndex + entries.length
      )

      state.order = newOrder
      state.positions = newPositions
      state.shuffleOrder = newShuffleOrder
      state.userQueuePositions = addedPositions
    },
    // Clears the user's queue
    userClearOwnQueue: (
      state,
      _action: PayloadAction<UserClearOwnQueuePayload>
    ) => {
      const userQueueEndIndex = getUserQueueEndIndex(state)
      const newOrder = state.order.slice(userQueueEndIndex)

      const newPositions = Object.keys(state.positions).reduce(
        (updated, uid) => {
          if (state.positions[uid] < userQueueEndIndex) {
            return updated
          } else {
            updated[uid] = state.positions[uid] - userQueueEndIndex
          }
          return updated
        },
        {} as { [uid: string]: number }
      )

      const newShuffleOrder = calculateNewShuffleOrder(newOrder, 0)
      state.order = newOrder
      state.positions = newPositions
      state.shuffleOrder = newShuffleOrder
    },
    // Adds a track to the queue either at the end or the given index.
    add: (state, action: PayloadAction<AddPayload>) => {
      const { entries, index } = action.payload

      const newIndex = index || state.order.length

      const newOrder = [...state.order]
      newOrder.splice(newIndex, 0, ...entries)

      const newPositions = calculateNewPositions(
        state.positions,
        newIndex,
        entries
      )

      const newShuffleOrder = calculateNewShuffleOrder(
        newOrder,
        getUserQueueEndIndex(state)
      )

      state.order = newOrder
      state.positions = newPositions
      state.shuffleOrder = newShuffleOrder
    },
    // Removes a specific uid from the queue
    remove: (state, action: PayloadAction<RemovePayload>) => {
      const { uid: uidToRemove } = action.payload

      const newOrder = state.order.filter((o) => o.uid !== uidToRemove)

      const removedIndex = state.positions[uidToRemove]
      const newPositions = Object.keys(state.positions).reduce(
        (updated, uid) => {
          if (uid === uidToRemove) {
            return updated
          } else if (state.positions[uid] > removedIndex) {
            updated[uid] = state.positions[uid] - 1
          } else {
            updated[uid] = state.positions[uid]
          }
          return updated
        },
        {} as { [uid: string]: number }
      )

      const newShuffleOrder = calculateNewShuffleOrder(
        newOrder,
        getUserQueueEndIndex(state)
      )
      state.order = newOrder
      state.positions = newPositions
      state.shuffleOrder = newShuffleOrder
    },
    // Clears the queue and performs clean up on queued items.
    clear: (state, _action: PayloadAction<ClearPayload>) => {
      state.order = initialState.order
      state.positions = initialState.positions
      state.index = initialState.index
      state.shuffleOrder = initialState.shuffleOrder
      state.shuffleIndex = initialState.shuffleIndex
    }
  }
})

export const {
  play,
  queueAutoplay,
  pause,
  next,
  previous,
  updateIndex,
  repeat,
  shuffle,
  reorder,
  add,
  remove,
  clear
} = slice.actions

export default slice.reducer
export const actions = slice.actions
