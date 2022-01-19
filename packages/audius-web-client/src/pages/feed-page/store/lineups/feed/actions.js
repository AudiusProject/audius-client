import { LineupActions } from 'common/store/lineup/actions'

export const PREFIX = 'DISCOVER_FEED'

class FeedActions extends LineupActions {
  constructor() {
    super(PREFIX)
  }
}

export const feedActions = new FeedActions()
