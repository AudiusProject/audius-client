import { Collection, Status } from "@audius/common"
import MobilePlaylistTile from 'components/track/mobile/ConnectedPlaylistTile'

type ChatMessagePlaylistProps = {
  playlist: Collection
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
  // maybe add an abstraction layer that uses web track tile -> mobile track tile
  // get mobile track tile props
  // - uid
  // - index,
  // - size,
  // - numLoadingSkeletonRows
  // - isTrending
  // - showRankIcon
  return (
    <div>yolo</div>
    // <MobilePlaylistTile />
  )
}
