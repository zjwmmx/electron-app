import _ from 'lodash'
import { createJsonMd5 } from './md5.utils'

class RequestQueue {
  constructor(request) {
    this.request = request
    this.tasks = {}
    this.results = {}
  }
  genRequestId(requestObj) {
    return createJsonMd5(requestObj)
  }

  getResult(requestId) {
    return this.results[requestId]
  }
  hasResult(requestId) {
    return this.results.hasOwnProperty(requestId)
  }

  run(name, data, isNow) {
    return new Promise((resolve, reject) => {
      let requestObj = {}
      let apiName
      let fn
      if (typeof name === 'string') {
        apiName = name
      } else if (_.isPlainObject(name)) {
        apiName = name.apiName
      }
      if (apiName) {
        const apiObj = this.request.resolveApi(apiName)
        requestObj.url = apiObj.url
        requestObj.method = apiObj.method
        requestObj.payload = data
        fn = () => apiObj.fn(requestObj.payload, false)
      } else {
        requestObj.method = name.method
        requestObj.url = name.url
        requestObj.payload = name.data || name.params
        fn = () =>
          this.request[requestObj.method](
            requestObj.url,
            requestObj.payload,
            false
          )
      }
      const requestId = this.genRequestId(requestObj)
      console.group(requestId)
      if (this.hasResult(requestId)) {
        console.log('有结果')
        const result = this.getResult(requestId)
        if (result.type !== 'pending') {
          const isExpire =
            Date.now() - result.time > this.request.options.cacheTime
          if (!isExpire) {
            console.log('走缓存')
            switch (result.type) {
              case 'success':
                resolve(result.data)
                console.groupEnd()
                return
              case 'failure':
                reject(result.error)
                console.groupEnd()
                return
            }
          } else {
            console.log('缓存过期', '重新发请求')
            delete this.results[requestId]
          }
        } else {
          console.log('待运行')
        }
      } else {
        console.log('没结果')
      }
      console.groupEnd()

      if (!this.tasks[requestId]) {
        const taskObj = {
          fallback: [],
          task: fn,
        }
        this.tasks[requestId] = taskObj
        this.results[requestId] = { type: 'pending' }
      }
      this.tasks[requestId].fallback.push({ resolve, reject })
      // if (isNow) {
      //   this.start()
      // }
    })
  }
  #runTask(requestId, taskObj) {
    taskObj.task().then(
      (data) => {
        taskObj.fallback
          .map((item) => item.resolve)
          .forEach((item) => {
            item(_.cloneDeep(data))
            this.results[requestId] = {
              type: 'success',
              data,
              time: Date.now(),
            }
          })
      },
      (error) => {
        taskObj.fallback
          .map((item) => item.reject)
          .forEach((item) => {
            this.results[requestId] = {
              type: 'failure',
              error,
              time: Date.now(),
            }
            item(error)
          })
      }
    )
  }
  start() {
    // console.log(this.tasks)
    Object.entries(this.tasks).forEach(([requestId, taskObj]) => {
      this.#runTask(requestId, taskObj)
    })
    // this.tasks = {}
  }
}

export function createRequestQueue(request) {
  return new RequestQueue(request)
}
