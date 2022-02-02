import React from 'react'

import { Track } from 'audius-client/src/common/models/Track'
import { User } from 'audius-client/src/common/models/User'
import { StyleSheet, View } from 'react-native'

import Text from 'app/components/text'
import UserBadges from 'app/components/user-badges/UserBadges'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { ThemeColors } from 'app/utils/theme'

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    root: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    trackTitle: {
      color: themeColors.neutral,
      fontSize: 18,
      marginBottom: 4
    },
    artist: {
      color: themeColors.secondary,
      fontSize: 18
    }
  })

type TrackInfoProps = {
  track: Track
  user: User
}

export const TrackInfo = ({ track, user }: TrackInfoProps) => {
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.root}>
      {user && track && (
        <>
          <Text numberOfLines={1} style={styles.trackTitle} weight='bold'>
            {track.title}
          </Text>
          <Text numberOfLines={1} style={styles.artist} weight='medium'>
            {user.name}
            <UserBadges
              user={{
                balance: user.balance,
                associated_wallets_balance: user.associated_wallets_balance,
                name: user.name,
                is_verified: user.is_verified
              }}
              badgeSize={12}
              hideName
            />
          </Text>
        </>
      )}
    </View>
  )
}
