import AsyncStorage from '@react-native-async-storage/async-storage'
import { orderBy, take } from 'lodash'

const MOST_LISTENED_CACHE_TOP_N_LIMIT = 4

type MostListenedCategoryCache = {
  topN: { id: number; count: number }[]
  counts: { [key: number]: number }
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
    const storedCache = await MostListenedCache.getStoredMostListenedCache()
    return new MostListenedCache(storedCache)
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
    console.log('MostListenedCache - updatedCache', this.cache)
    this.updateStoredCache()
  }

  async updateStoredCache() {
    try {
      await AsyncStorage.setItem(
        '@offline_collections',
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
      const mostListenedCache = await AsyncStorage.getItem(
        '@most_listened_cache'
      )

      if (!mostListenedCache) return {}

      return JSON.parse(mostListenedCache)
    } catch (e) {
      console.warn('Error reading most_listened_cache', e)
    }
  }
}

export let mostListenedCache: MostListenedCache
MostListenedCache.initialize().then(
  (initializedCache) => (mostListenedCache = initializedCache)
)
