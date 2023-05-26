import { StyleSheet } from 'react-native'

import type { TileProps } from 'app/components/core'
import { Tile } from 'app/components/core'

const styles = StyleSheet.create({
  tile: {
    minHeight: 72
  },
  chat: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  }
})

type LineupTileRootProps = TileProps & {
  isChat?: boolean
}

export const LineupTileRoot = (props: LineupTileRootProps) => {
  return <Tile {...props} styles={{ tile: [styles.tile, props.isChat ? styles.chat : undefined] }} />
}
