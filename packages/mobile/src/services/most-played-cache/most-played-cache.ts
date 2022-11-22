import AsyncStorage from '@react-native-async-storage/async-storage'
import { orderBy, take } from 'lodash'

export const MOST_LISTENED_CACHE_TOP_N_LIMIT = 4

type MostListenedCategoryCache = {
  topN: { id: number; count: number }[]
  counts: { [key: number]: number }
}

type MostListenedCacheData = {
  tracks: MostListenedCategoryCache
  collections: MostListenedCategoryCache
}

// shared instance
export let mostListenedCache: MostListenedCache
export class MostListenedCache {
  cache: MostListenedCacheData

  constructor(cache: MostListenedCacheData) {
    this.cache = cache
  }

  static async initialize() {
    const storedCache = await MostListenedCache.getStoredMostListenedCache()
    mostListenedCache = new MostListenedCache(storedCache)
  }

  incrementTrack(trackId: number) {
    return this.incrementCount(trackId, this.cache.tracks)
  }

  incrementCollection(collectionId: number) {
    return this.incrementCount(collectionId, this.cache.collections)
  }

  private incrementCount(
    idToIncrement: number,
    categoryCache: MostListenedCategoryCache
  ) {
    console.log('MostListenedCache - incrementing count', idToIncrement)
    // TODO: test this logic
    const newCount = (categoryCache.counts[idToIncrement] ?? 0) + 1
    categoryCache.counts[idToIncrement] = newCount
    const existing = categoryCache.topN.find(
      ({ id, count }) => id === idToIncrement
    )
    if (existing) {
      // already in top N
      existing.count = newCount
    } else if (
      categoryCache.topN.length < MOST_LISTENED_CACHE_TOP_N_LIMIT ||
      newCount > categoryCache.topN[MOST_LISTENED_CACHE_TOP_N_LIMIT - 1].count
    ) {
      // top N not full or belongs in top N
      categoryCache.topN.push({ id: idToIncrement, count: newCount })
    }

    categoryCache.topN = take(
      orderBy(categoryCache.topN, 'count', 'desc'),
      MOST_LISTENED_CACHE_TOP_N_LIMIT
    )
    console.log('MostListenedCache - updatedCache', this.cache)
    this.updateStoredCache()
  }

  async updateStoredCache() {
    try {
      await AsyncStorage.setItem(
        '@most_listened_cache',
        JSON.stringify(this.cache)
      )
    } catch (e) {
      console.warn('Error updating most_listened_cache', e)
    }
  }

  getMostListenedCollections = () => {
    return this.cache.collections.topN.map(({ id, count }) => id)
  }

  static async getStoredMostListenedCache() {
    try {
      console.log('MostListenedCache - init')
      const mostListenedCache = await AsyncStorage.getItem(
        '@most_listened_cache'
      )

      if (!mostListenedCache) {
        console.log('MostListenedCache - empty')
        return {
          tracks: { topN: [], counts: {} },
          collections: { topN: [], counts: {} }
        }
      }

      console.log('MostListenedCache - found stored string', mostListenedCache)

      return JSON.parse(mostListenedCache)
    } catch (e) {
      console.warn('Error reading most_listened_cache', e)
      return {
        tracks: { topN: [], counts: {} },
        collections: { topN: [], counts: {} }
      }
    }
  }
}

// Debug methods
global.clearMostPlayedCounts = async () => {
  console.log('clearing')
  await AsyncStorage.removeItem('@most_listened_cache')
  MostListenedCache.initialize()
}
