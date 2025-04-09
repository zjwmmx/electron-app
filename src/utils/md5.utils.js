import md5 from 'js-md5'
export function createJsonMd5(json = {}) {
  try {
    const content = JSON.stringify(json)
    return md5(content)
  } catch (error) {
    console.warn(error)
  }
  return null
}

export function createMd5(content = '') {
  return md5(content)
}
