import _ from 'lodash'
import dayjs from 'dayjs'

export const isUnix = (v) => _.toString(v).length === 10

function adapterUnix(v) {
  if (isUnix(v)) {
    return dayjs.unix(v)
  }

  return dayjs(v)
}
export const standardTime = (v) => {
  if (typeof v === 'string' && /^\d+$/.test(v)) {
    return adapterUnix(_.toNumber(v))
  }
  if (typeof v === 'number') {
    return adapterUnix(v)
  }

  return dayjs(v)
}
export const formatTime = (v, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (_.isNil(v)) return v
  return dayjs(standardTime(v)).format(format)
}

export const fromNow = (time) => {
  return dayjs(time).fromNow()
}

export function toUnix(date) {
  return dayjs(date).unix()
}

export function calcDuration(start, end, unit) {
  const startTime = standardTime(start)
  const endTime = standardTime(end)
  let res = endTime.diff(startTime, unit, true)
  return Math.round(res * 10) / 10
}

export function parseTime(time) {
  const res = _.chain(time)
    .split(':')
    .compact()
    .map((item) => _.toNumber(item))
    .value()
  return { hour: res[0], minute: res[1] }
}

export function setDateTime(date, time) {
  date = standardTime(date)
  const { hour, minute } = parseTime(time)
  return dayjs(date).hour(hour).minute(minute).second(0)
}

export function createDayjsFromTime(time = '') {
  const { hour, minute } = parseTime(time)
  return dayjs().hour(hour).minute(minute)
}

export function rangeToTimeString(data = []) {
  return data.map((item) => {
    return formatTime(item, 'HH:mm')
  })
}
