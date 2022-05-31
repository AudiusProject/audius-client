import { StyleProp, ViewStyle } from 'react-native'

import Skeleton from 'app/components/skeleton'
import { makeStyles } from 'app/styles'

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    marginTop: spacing(3),
    paddingBottom: spacing(1),
    height: 64,
    width: 220,
    marginRight: spacing(2)
  }
}))

type TopSupporterTileSkeletonProps = {
  style?: StyleProp<ViewStyle>
}

export const TopSupporterTileSkeleton = (
  props: TopSupporterTileSkeletonProps
) => {
  const { style } = props
  const styles = useStyles()
  return <Skeleton style={[styles.root, style]} />
}
