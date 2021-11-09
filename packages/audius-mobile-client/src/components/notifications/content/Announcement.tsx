import React from 'react'

import { View } from 'react-native'
import Markdown from 'react-native-markdown-display'

import { Announcement as AnnouncementNotification } from 'app/store/notifications/types'
import { useTheme } from 'app/utils/theme'

type AnnouncementProps = {
  notification: AnnouncementNotification
}

const Announcement = ({ notification }: AnnouncementProps) => {
  const body = useTheme(
    {
      fontFamily: 'AvenirNextLTPro-Medium',
      fontSize: 16
    },
    {
      color: 'neutral'
    }
  )

  const link = useTheme(
    {
      fontFamily: 'AvenirNextLTPro-Medium',
      fontSize: 16
    },
    {
      color: 'secondary'
    }
  )

  return (
    <View>
      <Markdown
        style={{
          body,
          link
        }}
      >
        {notification.shortDescription}
      </Markdown>
    </View>
  )
}

export default Announcement
