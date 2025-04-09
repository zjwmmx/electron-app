import { hasContentArray, runFun } from './base.utils'

import _ from 'lodash'

export const recursionTree = (data = [], options = {}) => {
  const json = Array.isArray(data) ? data : [data]
  const { childrenKey, visit, stop } = Object.assign(
    {
      childrenKey: 'children',
      stop: () => false,
      visit: () => {},
    },
    options
  )

  const walk = (list, parent, path = []) => {
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      const newPath = [...path, item]
      const isStop = stop(item)

      if (isStop) {
        visit(item, parent, i, newPath)
        break
      } else {
        visit(item, parent, i, newPath)
      }
      const children = item[childrenKey]
      if (children && children.length > 0) {
        walk(children, item, newPath)
      }
    }
  }
  walk(json, null)
}

export const arrayToTree = (list = [], options) => {
  const { parentKey, childrenKey } = _.merge(
    { parentKey: 'parentId', childrenKey: 'children' },
    options
  )
  const res = {
    root: [],
  }
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    item[childrenKey] = []
    res[item.id] = item
  }

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (item[parentKey] && res[item[parentKey]]) {
      res[item[parentKey]][childrenKey].push(item)
    } else {
      res.root.push(item)
    }
  }

  return res.root
}
export const findTree = (tree, fn, options) => {
  const { childrenKey } = _.merge({ childrenKey: 'children' }, options)
  const walk = (list, parent) => {
    return list.find((item, index) => {
      if (hasContentArray(item[childrenKey])) {
        item[childrenKey] = walk(item[childrenKey], parent)
      }
      return runFun(fn, null, item, index, parent)
    })
  }
  return walk(tree, null)
}
export const filterTree = (tree, fn, options) => {
  const { childrenKey } = _.merge({ childrenKey: 'children' }, options)
  const walk = (list) => {
    return list.filter((item, index) => {
      if (hasContentArray(item[childrenKey])) {
        item[childrenKey] = walk(item[childrenKey])
      }
      return runFun(fn, true, item, index)
    })
  }
  return walk(tree)
}

export const mapTree = (tree, fn, options) => {
  const { childrenKey } = _.merge({ childrenKey: 'children' }, options)
  const walk = (list) => {
    return list.map((item, index) => {
      if (hasContentArray(item[childrenKey])) {
        item[childrenKey] = walk(item[childrenKey])
      }
      return runFun(fn, true, item, index)
    })
  }
  return walk(tree)
}
