import _, { method } from 'lodash'

import axios from 'axios'
import cookies from 'js-cookie'
import { createJsonMd5 } from './md5.utils'
import { runFun } from './base.utils'

const defaultOptions = {
  baseURL: '/',
  getToken() {
    return cookies.get('token')
  },
  beforeRequest(config) {
    return config
  },
  onError() {},
}
const requestMethods = ['get', 'post', 'delete', 'put']

class RequestCache {
  constructor(cacheTime = 30 * 1000) {
    this.cache = {}
    this.cacheTime = cacheTime
  }
  #genCacheKey(obj) {
    return createJsonMd5(obj)
  }
  #resolveKey(obj) {
    return typeof obj === 'string' ? obj : this.#genCacheKey(obj)
  }
  isExpire(obj) {
    const key = this.#resolveKey(obj)
    if (this.hasCache(key)) {
      const data = this.cache[key]
      return Date.now() - data.time > this.cacheTime
    }
    return false
  }
  setCache(obj, data) {
    const key = this.#resolveKey(obj)
    this.cache[key] = {
      time: Date.now(),
      data,
    }
    return key
  }
  hasCache(obj) {
    const key = this.#resolveKey(obj)
    return this.cache.hasOwnProperty(key)
  }
  getCacheData(obj) {
    const key = this.#resolveKey(obj)
    return this.cache[key]?.data
  }
  cacheRequest(obj) {
    console.log(this.#resolveKey(obj))
  }
}

export class Request {
  constructor(options) {
    this.options = _.merge(_.cloneDeep(defaultOptions), options)
    this.cache = new RequestCache(this.options.cacheTime)
    this.request = axios.create({
      baseURL: this.options.baseURL,
    })

    this.#initial()
    this.apiMap = {}
  }
  callApi(name, params, options) {
    const api = this.resolveApi(name)
    return api.fn.call(this, params, options)
  }
  defineApi(name, url, method) {
    const fn = ((data, options) => {
      return this[method](url, data, options)
    }).bind(this)
    this.apiMap[name] = {
      url,
      method,
      fn,
    }
    Object.defineProperty(this, name, {
      value: fn,
    })
    return fn
  }
  resolveApi(name) {
    return this.apiMap[name]
  }
  #initial() {
    // 设置中间件
    this.request.interceptors.request.use((config) => {
      config = runFun(this.options.beforeRequest, config, config)

      config.params = {
        ...(config?.params || {}),
        _: Date.now(),
      }
      return config
    })
    this.request.interceptors.response.use(
      (res) => {
        res = runFun(this.options.onResponse, res, res)
        return res
      },
      (error) => {
        runFun(this.options.onError, error, error)
        return Promise.reject(error)
      }
    )

    // 代理请求方法
    requestMethods.forEach((methodKey) => {
      Object.defineProperty(this, methodKey, {
        value: (url, data, options) => {
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
            headers,
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
            if (this.cache.hasCache(obj) && !this.cache.isExpire(obj)) {
              return Promise.resolve(this.cache.getCacheData(obj))
            }
          }
          return this.request(obj).then((res) => {
            if (isCache) {
              this.cache.setCache(obj, res)
            }
            return res
          })
        },
      })
    })
  }
}
