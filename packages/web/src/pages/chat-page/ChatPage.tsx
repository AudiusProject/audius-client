import { RouteComponentProps } from 'react-router-dom'

import { useIsMobile } from 'utils/clientUtil'

import { ChatPage as DesktopChatPage } from './components/desktop/ChatPage'

export const ChatPage = ({ match }: RouteComponentProps<{ id?: string }>) => {
  const currentChatId = match.params.id
  const isMobile = useIsMobile()
  if (isMobile) {
    return <></>
  }
  return <DesktopChatPage currentChatId={currentChatId} />
}
