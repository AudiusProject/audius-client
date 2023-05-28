import { View } from 'react-native'

import { Text } from 'app/components/core'

type ChatMessageTrackProps = {
  link: string
  isAuthor: boolean
}

export const ChatMessagePlaylist = ({
  link,
  isAuthor
}: ChatMessageTrackProps) => {
  return (
    <View>
      <Text>playlist</Text>
    </View>
  )
}
