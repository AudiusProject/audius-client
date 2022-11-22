import AsyncStorage from '@react-native-async-storage/async-storage'
import { orderBy, take } from 'lodash'

export const MOST_PLAYED_CACHE_TOP_N_LIMIT = 4

type MostPlayedCategoryCache = {
  topN: { id: number; count: number }[]
  counts: { [key: number]: number }
}

type MostPlayedCacheData = {
  tracks: MostPlayedCategoryCache
  collections: MostPlayedCategoryCache
}

// shared instance
export let mostPlayedCache: MostPlayedCache | undefined
export class MostPlayedCache {
  cache: MostPlayedCacheData

  constructor(cache: MostPlayedCacheData) {
    this.cache = cache
  }

  static async initialize() {
    const storedCache = await MostPlayedCache.getStoredMostPlayedCache()
    mostPlayedCache = new MostPlayedCache(storedCache)
  }

  incrementTrack(trackId: number) {
    return this.incrementCount(trackId, this.cache.tracks)
  }

  incrementCollection(collectionId: number) {
    return this.incrementCount(collectionId, this.cache.collections)
  }

  private incrementCount(
    idToIncrement: number,
    categoryCache: MostPlayedCategoryCache
  ) {
    console.log('MostPlayedCache - incrementing count', idToIncrement)
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
      categoryCache.topN.length < MOST_PLAYED_CACHE_TOP_N_LIMIT ||
      newCount > categoryCache.topN[MOST_PLAYED_CACHE_TOP_N_LIMIT - 1].count
    ) {
      // top N not full or belongs in top N
      categoryCache.topN.push({ id: idToIncrement, count: newCount })
    }

    categoryCache.topN = take(
      orderBy(categoryCache.topN, 'count', 'desc'),
      MOST_PLAYED_CACHE_TOP_N_LIMIT
    )
    console.log('MostPlayedCache - updatedCache', this.cache)
    this.updateStoredCache()
  }

  async updateStoredCache() {
    try {
      await AsyncStorage.setItem(
        '@most_Played_cache',
        JSON.stringify(this.cache)
      )
    } catch (e) {
      console.warn('Error updating most_Played_cache', e)
    }
  }

  getMostPlayedCollections = () => {
    return this.cache.collections.topN.map(({ id, count }) => id)
  }

  static async getStoredMostPlayedCache() {
    try {
      console.log('MostPlayedCache - init')
      const storedCache = await AsyncStorage.getItem('@most_Played_cache')

      if (!storedCache) {
        console.log('MostPlayedCache - empty')
        return {
          tracks: { topN: [], counts: {} },
          collections: { topN: [], counts: {} }
        }
      }

      console.log('MostPlayedCache - found stored string', storedCache)

      return JSON.parse(storedCache)
    } catch (e) {
      console.warn('Error reading most_Played_cache', e)
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
  await AsyncStorage.removeItem('@most_Played_cache')
  MostPlayedCache.initialize()
}
