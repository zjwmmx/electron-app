import _ from 'lodash'

export function copy(text) {
  const textarea = document.createElement('textarea')
  document.body.appendChild(textarea)
  textarea.value = text
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
// 获取黏贴版内容
export function getPasteContent() {
  return navigator.clipboard.readText()
}

export const isAvailableData = (data) => {
  return !_.isNil(data) && data !== ''
}
export const hasContentArray = (data) => {
  if (_.isNil(data)) return false
  return _.isArray(data) && !_.isEmpty(data)
}

export const isComplexData = (data) => {
  return _.isArray(data) || _.isObject(data)
}
export const pickAvailableData = (data) => {
  return _.pickBy(data, (value) => isAvailableData(value))
}
export const listToMapWith = (key, list = [], valueKey) => {
  return list.reduce((acc, item) => {
    const keyName = item[key]
    let value = item
    if (isAvailableData(valueKey)) {
      if (_.isString(valueKey)) {
        value = item[valueKey]
      } else if (_.isFunction(valueKey)) {
        value = runFun(valueKey, item, item)
      }
    }
    return {
      ...acc,
      [keyName]: value,
    }
  }, {})
}

export function runFun(fun, defaultReturn = null, ...args) {
  if (!_.isNil(fun)) {
    return fun(...args)
  }
  return defaultReturn
}

export function isPromise(prom) {
  if (_.isNil(prom) || !_.isObject(prom)) return false
  return (
    _.isFunction(prom.__proto__.then) &&
    _.isFunction(prom.__proto__.catch) &&
    _.isFunction(prom.__proto__.finally)
  )
}

export const valueStrategy = (map = {}, defaultValue) => {
  return (key) => {
    const value = map[key]
    return _.isNil(value) ? defaultValue : value
  }
}

export const cond = (caseList = [], defaultValue = null) => {
  return (...args) => {
    for (let i = 0; i < caseList.length; i++) {
      const [condition, effect] = caseList[i]
      let match
      if (Array.isArray(condition)) {
        match = condition.every((condItem) => {
          return runFun(condItem, false, ...args)
        })
      } else {
        match = runFun(condition, false, ...args)
      }
      if (match) {
        return runFun(effect, defaultValue, ...args)
      }
    }
  }
}

export const functionStrategy = (map = {}) => {
  return (key, args = [], defaultReturn) => {
    return runFun(map[key], defaultReturn, ...args)
  }
}

export const objToArray = (
  obj = {},
  options = { labelKey: 'label', valueKey: 'value' }
) => {
  const data = _.cloneDeep(obj)
  const { labelKey, valueKey } = options
  const fields = Object.keys(data)
  if (fields.length === 0) return []
  return fields.map((key) => {
    return {
      [labelKey]: key,
      [valueKey]: obj[key],
    }
  })
}
export const mapToJson = (map) => {
  const res = {}
  if (map instanceof Map) {
    for (const [key, value] of map.entries()) {
      res[key] = value
    }
  }
  return res
}

export const toArray = (data) => {
  if (_.isNil(data)) {
    return []
  }
  return Array.isArray(data) ? data : [data]
}

export const funWrap = (data) => () => data

export const compose = (...fns) => {
  return (ctx, next) => {
    let index = -1
    const dispatch = (i) => {
      index = i
      let fn = fns[i]
      if (i === fns.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)))
      } catch (error) {
        return Promise.reject(error)
      }
    }
    return dispatch(0)
  }
}

export const ifElse = (predictFn, successFn, failFn) => {
  return (...params) => {
    const res = runFun(predictFn, false)
    if (res) {
      return runFun(successFn, null, ...params)
    } else {
      return runFun(failFn, null, ...params)
    }
  }
}
export const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}
// 从元组中转为对象
export const markNameFromTuple = (names = [], arr = []) => {
  return names.reduce((acc, name, index) => {
    return {
      ...acc,
      [name]: arr[index],
    }
  }, {})
}

export const tupleToObj = (names = [], tuple = []) => {
  return names.reduce((acc, name, index) => {
    return {
      ...acc,
      [name]: tuple[index],
    }
  }, {})
}
export const tupleListToArray = (names = [], tupleList = []) => {
  return tupleList.map((tuple) => {
    return tupleToObj(names, tuple)
  })
}

export const createOptionByArray = (arr = []) => {
  return arr.map((item) => {
    return {
      label: item,
      value: item,
    }
  })
}
export const maybeFun = (data, ...args) => {
  if (typeof data === 'function') {
    return data(...args)
  }
  return data
}
export const getDataType = (value) => {
  const res = Object.prototype.toString.call(value)
  const match = res.toLowerCase().match(/\[object (.+)\]/)

  return _.get(match, 1)
}
// 遍历复杂数据
export const eachComplexData = (json, fn) => {
  const walk = (data, { deep, path }) => {
    for (const key in data) {
      const dataPath = path ? [...path, key] : [key]
      if (Object.hasOwnProperty.call(data, key)) {
        const element = data[key]
        if (_.isArray(element) || _.isObject(element)) {
          fn?.({
            key,
            value: element,
            dataType: getDataType(element),
            dataPath,
            parent: data,
          })
          walk(element, {
            deep: deep + 1,
            path: dataPath,
          })
        } else {
          fn?.({
            key,
            value: element,
            dataType: getDataType(element),
            dataPath,
            parent: data,
          })
        }
      }
    }
  }
  if (!isComplexData(json)) return
  walk(json, { deep: 1 })
}

export const pickDataByArray = (array = [], fieldMaps = []) => {
  return array.map((item) => {
    const newItem = {}
    fieldMaps.forEach((fieldMap) => {
      if (Array.isArray(fieldMap)) {
        const [oldField, newField] = fieldMap
        newItem[newField] = item[oldField]
      }
    })
    return newItem
  })
}

export const checkIs = (checkList = [], str = '') => {
  return checkList.some((item) => {
    if (typeof item === 'string') {
      return item === str
    }
    if (item instanceof RegExp) {
      return item.test(str)
    }
    return false
  })
}


export function createRetryFun(
  fn,
  count,
  { maxCount = 10, retryTime = 1000 } = {}
) {
  let _count = count
  let _error = null
  async function _run(...args) {
    _count = Math.min(_count, maxCount)
    while (_count > 0) {
      try {
        return await fn?.(...args)
      } catch (error) {
        await sleep(retryTime)
        _count -= 1
        _error = error
        continue
      }
    }
    throw _error
  }
  return async (...args) => {
    _count = count
    _error = null
    if (!_.isNil(_count) && _.isNumber(_count) && _count > 0) {
      return await _run(...args)
    }
    return await fn?.(...args)
  }
}
