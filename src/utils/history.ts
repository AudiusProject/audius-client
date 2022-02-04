import {
  BrowserHistoryBuildOptions,
  createBrowserHistory,
  createHashHistory,
  HashHistoryBuildOptions,
  History
} from 'history'

const USE_HASH_ROUTING = process.env.REACT_APP_USE_HASH_ROUTING === 'true'
const basename = process.env.PUBLIC_URL

let history: History
if (USE_HASH_ROUTING) {
  const config: HashHistoryBuildOptions = {}
  if (basename) {
    config.basename = basename
  }
  history = createHashHistory(config)
} else {
  const config: BrowserHistoryBuildOptions = {}
  if (basename) {
    config.basename = basename
  }
  history = createBrowserHistory(config)
}

export default history
