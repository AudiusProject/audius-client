import IconNoWifi from 'app/assets/images/iconNoWifi.svg'
import IconRefresh from 'app/assets/images/iconRefresh.svg'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { Button, Text, Tile } from 'app/components/core'
import { View } from 'react-native'

const useStyles = makeStyles(({ palette, typography }) => ({
  button: {
    marginVertical: spacing(4)
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontByWeight.bold,
    marginVertical: spacing(4)
  },
  icon: {
    height: spacing(4),
    width: spacing(4)
  },
  tile: {
    display: 'flex',
    padding: spacing(4),
    paddingBottom: spacing(10),
    margin: spacing(3)
  },
  subHeading: {
    fontSize: typography.fontSize.small,
    textAlign: 'center',
    lineHeight: 21
  }
}))

export const OfflinePlaceholder = () => {
  const styles = useStyles()

  return (
    <Tile
      styles={{
        tile: styles.tile
      }}
    >
      <View style={styles.container}>
        <IconNoWifi />
        <Text style={styles.header}>You're Offline</Text>
        <Text style={styles.subHeading}>
          {'We Couldn’t Load the Page.\nConnect to the Internet and Try Again.'}
        </Text>
        <Button
          title={'Reload'}
          fullWidth
          icon={IconRefresh}
          iconPosition='left'
          styles={{ root: styles.button, icon: styles.icon }}
          size='large'
        />
      </View>
    </Tile>
  )
}
