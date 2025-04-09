import _ from 'lodash'
import { recursionTree } from './tree.utils'

export function genActualUrl(template, data = {}) {
  let match
  while ((match = template.match(/(:[^:/]+)/))) {
    const word = match[1]
    const key = word.replace(':', '')
    const value = data[key] ? data[key] : ''
    template = template.replace(word, value)
  }
  return template
}

export function menusBuilder(menus) {
  return (data) => {
    const res = _.cloneDeep(menus)
    recursionTree(res, {
      visit: (item) => {
        if (item.url) {
          item.url = genActualUrl(item.url, data)
        }
      },
    })
    return res
  }
}


