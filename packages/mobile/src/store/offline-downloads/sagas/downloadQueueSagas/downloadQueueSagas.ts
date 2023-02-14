import { requestDownloadQueuedItemSaga } from './requestDownloadQueuedItemSaga'
import { watchAddOfflineItems } from './watchAddOfflineItems'
import { watchNetworkType } from './watchNetworkType'
// import { watchReachability } from './watchReachability'

export function downloadQueueSagas() {
  return [requestDownloadQueuedItemSaga, watchNetworkType, watchAddOfflineItems]
}
