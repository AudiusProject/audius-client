import { SkeletonChatListItem } from '../desktop/SkeletonChatListItem'

import { DownloadTheAppDrawer } from './DownloadTheAppDrawer'

export const ChatPage = () => {
  return (
    <>
      <SkeletonChatListItem />
      <SkeletonChatListItem style={{ opacity: 0.9 }} />
      <SkeletonChatListItem style={{ opacity: 0.8 }} />
      <SkeletonChatListItem style={{ opacity: 0.7 }} />
      <SkeletonChatListItem style={{ opacity: 0.6 }} />
      <SkeletonChatListItem style={{ opacity: 0.5 }} />
      <SkeletonChatListItem style={{ opacity: 0.4 }} />
      <SkeletonChatListItem style={{ opacity: 0.3 }} />
      <SkeletonChatListItem style={{ opacity: 0.2 }} />
      <SkeletonChatListItem style={{ opacity: 0.1 }} />
      <DownloadTheAppDrawer />
    </>
  )
}
