import { LineupActions } from 'common/store/lineup/actions'

export const PREFIX = 'TRACK_TRACKS'

class TracksActions extends LineupActions {
  constructor() {
    super(PREFIX)
  }
}

export const tracksActions = new TracksActions()
