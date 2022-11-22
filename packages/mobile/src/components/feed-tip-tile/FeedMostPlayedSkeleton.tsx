import { range } from 'lodash'
import { View } from 'react-native'

import { makeStyles } from 'app/styles'

import { Tile } from '../core'
import Skeleton from '../skeleton'

const useStyles = makeStyles(({ palette, typography, spacing }) => ({
  root: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing(3)
  },
  cardRoot: {
    paddingTop: 12,
    marginLeft: 12,
    width: 177
  },
  cardContent: {
    paddingHorizontal: spacing(2)
  },
  imgContainer: {
    paddingTop: spacing(2),
    paddingHorizontal: spacing(1)
  },
  cardImg: {
    backgroundColor: '#ddd',
    borderRadius: 6,
    overflow: 'hidden',
    paddingBottom: '100%'
  },
  textContainer: {
    marginVertical: 3.5
  },
  text: {
    marginTop: spacing(1),
    height: 17
  }
}))

export const FeedMostPlayedSkeleton = ({ length }: { length: number }) => {
  const styles = useStyles()

  return (
    <View style={styles.root}>
      {range(0, length).map((id) => (
        <Tile
          key={id}
          styles={{ root: styles.cardRoot, content: styles.cardContent }}
        >
          <View style={styles.imgContainer}>
            <Skeleton style={styles.cardImg} />
          </View>
          <View style={styles.textContainer}>
            <Skeleton style={styles.text} />
            <Skeleton style={styles.text} />
          </View>
        </Tile>
      ))}
    </View>
  )
}
