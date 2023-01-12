import { View } from 'react-native'

import { Tile } from 'app/components/core'
import { Skeleton, StaticSkeleton } from 'app/components/skeleton'
import { makeStyles } from 'app/styles'

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    height: 216
  },
  cardContent: {
    paddingHorizontal: spacing(2)
  },
  image: {
    marginTop: spacing(2),
    height: 152,
    width: '100%',
    borderRadius: 152 / 2,
    alignSelf: 'center'
  },
  textContainer: {
    paddingVertical: spacing(1),
    alignItems: 'center'
  },
  title: {
    height: 16,
    width: 75,
    marginVertical: spacing(1)
  },
  stats: {
    height: 14,
    width: 150
  }
}))

export const ProfileCardSkeleton = () => {
  const styles = useStyles()
  return (
    <Tile styles={{ tile: styles.root, content: styles.cardContent }}>
      <Skeleton style={styles.image} />
      <View style={styles.textContainer}>
        <StaticSkeleton style={styles.title} />
        <StaticSkeleton style={styles.stats} />
      </View>
    </Tile>
  )
}
