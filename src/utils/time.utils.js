import dayjs from 'dayjs'

/**
 * 倒计时函数，每秒钟触发一次
 * @param time 倒计时的时间，单位：秒
 * @param options
 * @returns
 */
export function countdown(time, options) {
  let timer
  let seconds = 0
  let isStart = false
  const tick = () => {
    clearTimeout(timer)
    const data = {
      day: Math.floor(seconds / (24 * 3600)),
      hour: Math.floor((seconds % (24 * 3600)) / 3600),
      minute: Math.floor((seconds % 3600) / 60),
      second: Math.floor(seconds % 60)
    }
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key]
        data[key] = value < 10 ? `0${value}` : value.toString()
      }
    }
    if (seconds > 0) {
      options?.onTick?.(seconds, data)
      seconds--
      timer = setTimeout(tick, 1000)
    } else {
      // clearTimeout(timer)
      options?.onEnd?.(seconds, data)
    }
  }

  const start = () => {
    if (!isStart) {
      options?.onStart?.()
      seconds = time
      tick()
      isStart = true
    }
  }
  const stop = () => {
    clearTimeout(timer)
    options?.onStop?.()
    isStart = false
  }
  const reset = () => {
    stop()
    seconds = time
  }

  return {
    reset,
    start,
    stop
  }
}
