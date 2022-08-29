import {
  Collection,
  CommonState,
  LineupBaseActions,
  LineupState,
  LineupTrack
} from '@audius/common'

export class LineupSagas {
  constructor(
    prefix: string,
    actions: LineupBaseActions,
    feedSelector: (
      store: CommonState
    ) => LineupState<{ id: number; activityTimestamp: number }>,
    getTracks: (config: {
      offset: number
      limit: number
    }) => Generator<any, any[], any>,
    keepActivityTimestamp: (
      entry: (LineupTrack | Collection) & { uid: string }
    ) => {
      uid: string
      kind: string
      id: number
      activityTimestamp: string | undefined
    }
  ): void

  getSagas(): Generator[]
}
