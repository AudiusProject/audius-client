import { Collection, Status } from '@audius/common'

import MobilePlaylistTile from 'components/track/mobile/ConnectedPlaylistTile'

type ChatMessagePlaylistProps = {
  playlist: Collection | undefined | null
  status: Status
  errorMessage: string | null | undefined
}

export const ChatMessagePlaylist = ({
  playlist,
  status,
  errorMessage
}: ChatMessagePlaylistProps) => {
  if (status === Status.ERROR) {
    return (
      // todo
      <div>error</div>
    )
  }
  // - numLoadingSkeletonRows
  return (
    <div>yolo</div>
    // You may wonder why we use the mobile web track tile here.
    // It's simply because the DMs track tile uses the mobile web version.
    // <MobilePlaylistTile />
  )
}
