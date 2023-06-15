import { RouteComponentProps } from 'react-router-dom'

import { useIsMobile } from 'utils/clientUtil'

import { ChatPage as DesktopChatPage } from './ChatPage'
import { ChatPage as MobileChatPage } from './components/mobile/ChatPage'

export const ChatPageProvider = ({
  match
}: RouteComponentProps<{ id?: string }>) => {
  const currentChatId = match.params.id
  const isMobile = useIsMobile()
  if (isMobile) {
    return <MobileChatPage />
  }
  return <DesktopChatPage currentChatId={currentChatId} />
}
