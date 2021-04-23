import { OpenNotificationsMessage } from 'services/native-mobile-interface/notifications'
import { OpenSearchMessage } from 'services/native-mobile-interface/search'

export const onNativeBack = (fromPage: string) => {
  switch (fromPage) {
    case 'notifications':
      new OpenNotificationsMessage().send()
      break
    case 'search':
      new OpenSearchMessage({ reset: false }).send()
      break
    default:
  }
}
