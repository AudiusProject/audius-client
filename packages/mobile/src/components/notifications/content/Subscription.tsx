import { ReactNode } from 'react'

import { ConnectedUserSubscriptionNotification } from 'audius-client/src/common/store/notifications/types'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from 'app/utils/theme'

import Entity from './Entity'
import User from './User'
import UserImages from './UserImages'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  textWrapper: {
    marginLeft: 4,
    fontFamily: 'AvenirNextLTPro-Medium',
    fontSize: 16
  }
})

type SubscriptionProps = {
  notification: ConnectedUserSubscriptionNotification
}

const Subscription = ({ notification }: SubscriptionProps) => {
  const textWrapperStyle = useTheme(styles.textWrapper, {
    color: 'neutral'
  })

  const user = notification.user
  if (!user) return null

  const isMultipleUploads = notification.entities.length > 1
  let body: ReactNode
  if (isMultipleUploads) {
    body = (
      <Text>
        {` posted ${
          (notification as any).entities.length
        } new ${notification.entityType.toLowerCase()}s `}
      </Text>
    )
  } else {
    body = (
      <>
        <Text>{` posted a new ${notification.entityType.toLowerCase()} `}</Text>
        <Entity
          entity={notification.entities[0]}
          entityType={notification.entityType}
        />
      </>
    )
  }

  return (
    <View style={styles.container}>
      <UserImages notification={notification} users={[user]} />
      <Text style={textWrapperStyle}>
        <User user={user} />
        {body}
      </Text>
    </View>
  )
}

export default Subscription
