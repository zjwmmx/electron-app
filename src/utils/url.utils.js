import qs from 'qs'

export function parseUrlString(url = '') {
  const res = {}
  const [host, params] = url.split('?').filter(Boolean)
  res.url = host
  if (params) {
    res.params = qs.parse(params)
  }

  return res
}

export function json2queryString(json) {
  return qs.stringify(json)
}

export function parseUrlPathVariable(url = '') {
  const matches = url.match(/\{\{([^{}]+)\}\}/g)
  if (matches) {
    return matches.filter(Boolean).reduce((acc, item) => {
      const variableKey = /\{\{([^{}]+)\}\}/.exec(item)
      if (variableKey) {
        acc.push({
          name: variableKey[1].trim(),
        })
      }
      return acc
    }, [])
  }
  return []
}
