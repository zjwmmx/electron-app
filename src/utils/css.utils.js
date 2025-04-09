import _ from 'lodash'
import { isAvailableData } from './base.utils'

export const createCssSelector = (prefix, names, globalPrefix = 'st') => {
  const res = Object.create(null)
  const def = (key, value) => {
    if (isAvailableData(key)) {
      _.set(res, key, value)
    }
  }

  const walk = (map = {}, parent) => {
    for (const key in map) {
      const value = map[key]
      const currentKey = _.isArray(map)
        ? _.isObject(value)
          ? null
          : value
        : key
      let isParent = _.isObject(value) || _.isArray(value)
      if (isParent) {
        const keys = parent ? [...parent.keys, currentKey] : [currentKey]
        walk(value, {
          keys: keys.filter(Boolean),
          value,
          isArray: _.isArray(value),
        })
      }
      let cssKeys = [],
        cssName = ''

      if (parent) {
        cssKeys = [prefix, ...parent.keys, currentKey]
      } else {
        cssKeys = [prefix, currentKey]
      }

      cssName = [globalPrefix, ...cssKeys].join('-')
      cssKeys.shift()
      def(_.camelCase(cssKeys.map((item) => _.camelCase(item))), cssName)
    }
  }
  walk(names)
  def(_.camelCase(prefix), [globalPrefix, prefix].join('-'))
  return res
}

export const px2vw = (data) => `${(data / 750) * 100}vw`
