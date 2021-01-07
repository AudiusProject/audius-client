import React from 'react'
import DeletedPageProvider from './DeletedPageProvider'
import DeletedPageDesktopContent from './components/desktop/DeletedPage'
import DeletedPageMobileContent from './components/mobile/DeletedPage'
import { useIsMobile } from 'utils/clientUtil'
import User from 'models/User'
import Playable from 'models/Playable'

type DeletedPageContentProps = {
  title: string
  description: string
  canonicalUrl: string
  playable: Playable
  user: User
  deletedByArtist?: boolean
}

const DeletedPage = ({
  title,
  description,
  canonicalUrl,
  playable,
  user,
  deletedByArtist = true
}: DeletedPageContentProps) => {
  const isMobile = useIsMobile()

  const content = isMobile
    ? DeletedPageMobileContent
    : DeletedPageDesktopContent

  return (
    <DeletedPageProvider
      title={title}
      description={description}
      canonicalUrl={canonicalUrl}
      playable={playable}
      user={user}
      deletedByArtist={deletedByArtist}
    >
      {content}
    </DeletedPageProvider>
  )
}

export default DeletedPage
