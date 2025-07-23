import axios from 'axios'

import _ from 'lodash'
import { createCacheManager } from './cache.utils'
import { createJsonMd5 } from './md5.utils'

const requestMethods = ['get', 'post', 'delete', 'put']

const defaultOptions = {
  baseURL: '/',
  isCache: false,
  cacheTime: 30 * 1000,
  beforeRequest(config) {
    return config
  },
  onError(error) {},
  onResponse(res) {
    return res
  }
}

export function createRequest(options) {
  const res = {}
  const apiMap = {}
  options = _.merge(_.cloneDeep(defaultOptions), options)
  const cache = createCacheManager({
    cacheTime: 30 * 1000,
    genKey: (data) => {
      return createJsonMd5(data)
    }
  })
  const client = axios.create({
    baseURL: options.baseURL,
    ...options
  })

  // 设置中间件
  client.interceptors.request.use((config) => {
    const makeConfig = options.beforeRequest?.(config)
    config.params = {
      ...(makeConfig?.params || {}),
      _: Date.now()
    }
    return config
  })
  client.interceptors.response.use(
    (res) => {
      res = options.onResponse?.(res) || res
      return res
    },
    (error) => {
      options.onError?.(error)
      return Promise.reject(error)
    }
  )

  // 代理请求方法
  requestMethods.forEach((methodKey) => {
    res[methodKey] = (url, data, options) => {
      let isCache = false
      let headers = {}
      if (typeof options === 'boolean') {
        isCache = options
      } else if (_.isObject(options)) {
        if (_.has(options, 'isCache')) {
          isCache = options.isCache
        }

        if (_.has(options, 'headers') && _.isObject(options.headers)) {
          headers = options.headers
        }
      }

      const obj = {
        url,
        method: methodKey,
        headers
      }
      const cacheKey = {
        url,
        method: methodKey,
        headers,
        params: data
      }

      if (_.has(options, 'responseType')) {
        obj.responseType = _.get(options, 'responseType')
      }
      if (_.has(options, 'cancelToken')) {
        obj.cancelToken = _.get(options, 'cancelToken')
      }
      if (data) {
        if (['get', 'delete'].includes(methodKey)) {
          obj.params = data
        } else if (['post', 'put'].includes(methodKey)) {
          obj.data = data
          if (_.has(options, 'params')) {
            obj.params = _.get(options, 'params')
          }
        }
      }

      if (isCache) {
        if (cache.hasCache(cacheKey) && !cache.isExpire(cacheKey)) {
          return Promise.resolve(cache.getCacheData(cacheKey))
        }
      }
      return client.request(obj).then((res) => {
        if (isCache) {
          cache.setCache(cacheKey, res)
        }
        return res
      })
    }
  })

  function resolveApi(name) {
    return apiMap[name]
  }

  function callApi(name, params, options) {
    const api = resolveApi(name)
    return api?.fn?.(params, options)
  }

  function defineApi(name, url, method) {
    const fn = (data, options) => {
      return res[method](url, data, options)
    }
    apiMap[name] = {
      url,
      method,
      fn
    }
    res[name] = fn

    return fn
  }

  res.defineApi = defineApi
  res.callApi = callApi
  return res
}
