// type CacheKey = string
// type CacheManagerOptions<KeyData extends Record<PropertyKey, any>> = {
//   cacheTime: number
//   genKey(data: KeyData): CacheKey
// }
// type CacheItem = {
//   time: number
//   data: any
// }

// type CacheMap = Record<CacheKey, CacheItem>

// export type CacheManager<KeyData extends Record<PropertyKey, any>> = {
//   hasCache(keyData: KeyData): boolean,
//   isExpire(keyData: KeyData): boolean,
//   setCache(keyData: KeyData, data: any): void,
//   getCacheData(keyData: KeyData): KeyData | null
// }

export function createCacheManager({ cacheTime, genKey }) {
  const cache = {}

  function resolveKey(data) {
    return typeof data === 'string' ? data : genKey(data)
  }

  function setCache(keyData, data) {
    const cacheKey = resolveKey(keyData)
    const cacheItem = {
      time: Date.now(),
      data
    }
    cache[cacheKey] = cacheItem
  }

  function hasCache(keyData) {
    const cacheKey = resolveKey(keyData)
    return cacheKey in cache
  }
  function isExpire(keyData) {
    const cacheKey = resolveKey(keyData)
    if (!hasCache(cacheKey)) {
      return true
    }
    const { time } = cache[cacheKey]
    if (time + cacheTime > Date.now()) {
      return true
    }
    return false
  }

  function getCacheData(keyData) {
    const cacheKey = resolveKey(keyData)
    if (hasCache(cacheKey)) {
      return cache[cacheKey].data
    }
    return null
  }

  return {
    hasCache,
    isExpire,
    setCache,
    getCacheData
  }
}
