import { View } from 'react-native'

import Skeleton from 'app/components/skeleton'
import { makeStyles } from 'app/styles'

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  root: {
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(6),
    backgroundColor: palette.white,
    borderColor: palette.neutralLight8,
    borderBottomWidth: 1
  },
  contentRoot: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  profilePicture: {
    width: spacing(12),
    height: spacing(12),
    borderRadius: spacing(6)
  },
  userContainer: {
    display: 'flex',
    flexDirection: 'row'
  },
  userTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 2,
    marginLeft: spacing(2),
    marginBottom: spacing(2)
  },
  userNameContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: spacing(1)
  },
  userName: {
    height: spacing(5),
    width: spacing(30)
  },
  handle: {
    height: spacing(4),
    width: spacing(20)
  },
  latestMessage: {
    marginTop: spacing(2),
    height: spacing(4),
    width: spacing(50)
  }
}))

export const ChatListItemSkeleton = () => {
  const styles = useStyles()

  return (
    <>
      <View style={styles.contentRoot}>
        <View style={styles.userContainer}>
          <Skeleton style={styles.profilePicture} />
          <View style={styles.userTextContainer}>
            <View style={styles.userNameContainer}>
              <Skeleton style={styles.userName} />
            </View>
            <Skeleton style={styles.handle} />
          </View>
        </View>
      </View>
      <Skeleton style={styles.latestMessage} />
    </>
  )
}
