import AsyncStorage from '@react-native-async-storage/async-storage'
import { orderBy, take } from 'lodash'

const MOST_LISTENED_CACHE_TOP_N_LIMIT = 4

type MostListenedCategoryCache = {
  topN: { id: string; count: number }[]
  counts: { [key: string]: number }
}

type MostListenedCacheData = {
  tracks: MostListenedCategoryCache
  collections: MostListenedCategoryCache
}

export class MostListenedCache {
  cache: MostListenedCacheData

  constructor(cache: MostListenedCacheData) {
    this.cache = cache
  }

  static async initialize() {
    getStoredMostListenedCache().then((storedCache) => {
      return new MostListenedCache(storedCache)
    })
  }

  incrementCount(
    idToIncrement: string,
    categoryCache: MostListenedCategoryCache
  ) {
    // TODO: test this logic
    const newCount = ++categoryCache.counts[idToIncrement]
    const existing = categoryCache.topN.find(
      ({ id, count }) => id === idToIncrement
    )
    if (existing) {
      existing.count = newCount
      return
    }
    if (categoryCache.topN.every(({ id, count }) => newCount > count)) {
      if (categoryCache.topN.length < MOST_LISTENED_CACHE_TOP_N_LIMIT) {
        categoryCache.topN.push({ id: idToIncrement, count: newCount })
        categoryCache.topN = take(
          orderBy(categoryCache.topN, 'count', 'desc'),
          MOST_LISTENED_CACHE_TOP_N_LIMIT
        )
      }
    }
  }

  async logLocalTrackListen(trackId: string) {
    try {
      this.cache.tracks[trackId]++
      await AsyncStorage.mergeItem(
        '@offline_collections',
        JSON.stringify({
          [trackId]: this.cache.tracks[trackId]
        })
      )
    } catch (e) {
      console.warn('Error updating most_listened_cache', e)
    }
  }

  async logLocalCollectionListen(collectionId: string) {
    try {
      this.cache.collections[collectionId]++
      await AsyncStorage.mergeItem(
        '@offline_collections',
        JSON.stringify({
          [collectionId]: this.cache.collections[collectionId]
        })
      )
    } catch (e) {
      console.warn('Error updating most_listened_cache', e)
    }
  }

  getMostListenedCollections = () => {
    this.cache.collections.orderBy()
  }
}

export const getStoredMostListenedCache = async () => {
  try {
    const mostListenedCache = await AsyncStorage.getItem('@most_listened_cache')

    if (!mostListenedCache) return {}

    return JSON.parse(mostListenedCache)
  } catch (e) {
    console.warn('Error reading most_listened_cache', e)
  }
}
