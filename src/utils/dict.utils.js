import _ from 'lodash'

function normalizeValue(item, valueKey) {
  if (_.isString(item)) return item
  if (_.isObject(item)) return _.get(item, valueKey)
}

function normalizeLabel(item, labelKey) {
  if (_.isString(item)) return item
  if (_.isObject(item)) return _.get(item, labelKey)
}

export function createDict(
  dataSource,
  { labelKey, valueKey } = { labelKey: 'label', valueKey: 'value' }
) {
  let isArray = Array.isArray(dataSource)
  let normalizeData
  if (isArray) {
    normalizeData = _.map(dataSource, (item) => {
      return {
        ...item,
        label: normalizeLabel(item, labelKey),
        value: normalizeValue(item, valueKey),
      }
    })
  } else {
    normalizeData = _.mapValues(dataSource, (item, key) => {
      return {
        ...item,
        label: normalizeLabel(item, labelKey),
        value: normalizeValue(item, valueKey),
      }
    })
  }

  const enumData = isArray
    ? normalizeData.reduce((acc, item) => {
        return {
          ...acc,
          [item.value]: item.value,
        }
      }, {})
    : _.mapValues(normalizeData, 'value')
  const options = Object.values(normalizeData)
  const values = _.map(options, 'value')
  const labels = _.map(options, 'label')
  function getOption(value) {
    return _.find(options, { value })
  }
  function getField(value, fieldName) {
    return _.get(getOption(value), fieldName)
  }
  function getLabel(value) {
    return getField(value, 'label')
  }
  // 获取部分的选项
  function pickOptions(values = []) {
    return options.filter((item) => {
      return values.includes(item.value)
    })
  }
  // 排除部分的选项
  function omitOptions(values = []) {
    return options.filter((item) => {
      return !values.includes(item.value)
    })
  }
  // 获取部分的值
  function pickValues(valueList = []) {
    return values.filter((item) => {
      return valueList.includes(item)
    })
  }
  // 排除部分的值
  function omitValues(valueList = []) {
    return values.filter((item) => {
      return !valueList.includes(item)
    })
  }
  function invoke(value, propertyPath, ...params) {
    const option = getOption(value)
    if (option) {
      return _.invoke(option, propertyPath, ...params)
    }
  }
  return {
    ...enumData,
    values,
    labels,
    enumData,
    options,
    pickValues,
    omitValues,
    getOption,
    getField,
    getLabel,
    pickOptions,
    omitOptions,
    invoke,
  }
}

export function stringArrayToOptions(arr = []) {
  return arr.map((item) => ({ label: item, value: item }))
}
