import { useEffect, useMemo } from 'react'

import type { UserCollection } from '@audius/common'
import { useProxySelector, collectionPageActions } from '@audius/common'
import { View } from 'react-native'

import { Tile } from 'app/components/core'
import { getCollectionList } from 'app/screens/favorites-screen/selectors'
import { mostListenedCache } from 'app/services/most-listened-cache'
import { makeStyles } from 'app/styles'

import { CollectionList } from '../collection-list'

import { FeedMostPlayedTileSkeleton } from './FeedMostPlayedTileSkeleton'
const { fetchCollection } = collectionPageActions

const useStyles = makeStyles(({ spacing, palette }) => ({
  tile: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing(3),
    marginTop: spacing(3),
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(4)
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  skeleton: {
    paddingBottom: 0
  },
  iconRemove: {
    height: spacing(6),
    width: spacing(6),
    fill: palette.neutralLight4
  }
}))

export const FeedMostPlayedTile = () => {
  const styles = useStyles()

  const topPlays = useMemo(() => {
    return mostListenedCache.getMostListenedCollections()
  }, []) // [] to get only once

  useEffect(() => {
    topPlays.forEach((collectionId) => fetchCollection(collectionId))
  }, [topPlays])

  const collections = useProxySelector(
    (state) => getCollectionList(state, topPlays),
    [topPlays]
  )

  return !collections ? (
    <View style={styles.skeleton}>
      <FeedMostPlayedTileSkeleton />
    </View>
  ) : (
    <Tile styles={{ tile: styles.tile }}>
      <View style={styles.header}>
        <CollectionList
          listKey='favorites-albums'
          scrollEnabled={false}
          collection={(collections as UserCollection[]) ?? []}
          style={{ marginVertical: 12 }}
        />
      </View>
    </Tile>
  )
}
