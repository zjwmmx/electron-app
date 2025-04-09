import _ from 'lodash'
import { logger } from './logger'

// 深度合并对象
export function deepMerge(target, source) {
  return _.merge({}, target, source)
}

// 安全地执行函数
export function safeExecute(fn, context = '', defaultValue = null) {
  try {
    return fn()
  } catch (error) {
    logger.error(`Error in ${context}`, error)
    return defaultValue
  }
}

// 防抖函数
export function debounce(fn, wait = 300) {
  return _.debounce(fn, wait)
}

// 节流函数
export function throttle(fn, wait = 300) {
  return _.throttle(fn, wait)
}

// 格式化日期
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  return _.format(date, format)
}

// 检查对象是否为空
export function isEmpty(value) {
  return _.isEmpty(value)
}

// 检查对象是否相等
export function isEqual(value, other) {
  return _.isEqual(value, other)
}

// 生成唯一ID
export function generateId() {
  return _.uniqueId()
}

// 随机数生成
export function random(min, max) {
  return _.random(min, max)
}

// 数组去重
export function uniq(array) {
  return _.uniq(array)
}

// 数组扁平化
export function flatten(array) {
  return _.flatten(array)
}

// 对象转数组
export function toArray(object) {
  return _.toArray(object)
}

// 对象转字符串
export function toString(value) {
  return _.toString(value)
}

// 检查是否为数字
export function isNumber(value) {
  return _.isNumber(value)
}

// 检查是否为字符串
export function isString(value) {
  return _.isString(value)
}

// 检查是否为对象
export function isObject(value) {
  return _.isObject(value)
}

// 检查是否为数组
export function isArray(value) {
  return _.isArray(value)
}

// 检查是否为函数
export function isFunction(value) {
  return _.isFunction(value)
}

// 检查是否为布尔值
export function isBoolean(value) {
  return _.isBoolean(value)
}

// 检查是否为日期
export function isDate(value) {
  return _.isDate(value)
}

// 检查是否为错误
export function isError(value) {
  return _.isError(value)
}

// 检查是否为null
export function isNull(value) {
  return _.isNull(value)
}

// 检查是否为undefined
export function isUndefined(value) {
  return _.isUndefined(value)
}

// 检查是否为NaN
export function isNaN(value) {
  return _.isNaN(value)
}

// 检查是否为有限数
export function isFinite(value) {
  return _.isFinite(value)
}

// 检查是否为整数
export function isInteger(value) {
  return _.isInteger(value)
}

// 检查是否为安全整数
export function isSafeInteger(value) {
  return _.isSafeInteger(value)
}

// 检查是否为偶数
export function isEven(value) {
  return _.isEven(value)
}

// 检查是否为奇数
export function isOdd(value) {
  return _.isOdd(value)
}

// 检查是否为正数
export function isPositive(value) {
  return _.isPositive(value)
}

// 检查是否为负数
export function isNegative(value) {
  return _.isNegative(value)
}

// 检查是否为零
export function isZero(value) {
  return _.isZero(value)
}

// 检查是否为无穷大
export function isInfinite(value) {
  return _.isInfinite(value)
}

// 检查是否为无穷小
export function isInfinitesimal(value) {
  return _.isInfinitesimal(value)
}

// 检查是否为质数
export function isPrime(value) {
  return _.isPrime(value)
}

// 检查是否为回文
export function isPalindrome(value) {
  return _.isPalindrome(value)
}

// 检查是否为回文数
export function isPalindromeNumber(value) {
  return _.isPalindromeNumber(value)
}

// 检查是否为回文字符串
export function isPalindromeString(value) {
  return _.isPalindromeString(value)
}

// 检查是否为回文数组
export function isPalindromeArray(value) {
  return _.isPalindromeArray(value)
}

// 检查是否为回文对象
export function isPalindromeObject(value) {
  return _.isPalindromeObject(value)
}

// 检查是否为回文函数
export function isPalindromeFunction(value) {
  return _.isPalindromeFunction(value)
}

// 检查是否为回文布尔值
export function isPalindromeBoolean(value) {
  return _.isPalindromeBoolean(value)
}

// 检查是否为回文日期
export function isPalindromeDate(value) {
  return _.isPalindromeDate(value)
}

// 检查是否为回文错误
export function isPalindromeError(value) {
  return _.isPalindromeError(value)
}

// 检查是否为回文null
export function isPalindromeNull(value) {
  return _.isPalindromeNull(value)
}

// 检查是否为回文undefined
export function isPalindromeUndefined(value) {
  return _.isPalindromeUndefined(value)
}

// 检查是否为回文NaN
export function isPalindromeNaN(value) {
  return _.isPalindromeNaN(value)
}

// 检查是否为回文有限数
export function isPalindromeFinite(value) {
  return _.isPalindromeFinite(value)
}

// 检查是否为回文整数
export function isPalindromeInteger(value) {
  return _.isPalindromeInteger(value)
}

// 检查是否为回文安全整数
export function isPalindromeSafeInteger(value) {
  return _.isPalindromeSafeInteger(value)
}

// 检查是否为回文偶数
export function isPalindromeEven(value) {
  return _.isPalindromeEven(value)
}

// 检查是否为回文奇数
export function isPalindromeOdd(value) {
  return _.isPalindromeOdd(value)
}

// 检查是否为回文正数
export function isPalindromePositive(value) {
  return _.isPalindromePositive(value)
}

// 检查是否为回文负数
export function isPalindromeNegative(value) {
  return _.isPalindromeNegative(value)
}

// 检查是否为回文零
export function isPalindromeZero(value) {
  return _.isPalindromeZero(value)
}

// 检查是否为回文无穷大
export function isPalindromeInfinite(value) {
  return _.isPalindromeInfinite(value)
}

// 检查是否为回文无穷小
export function isPalindromeInfinitesimal(value) {
  return _.isPalindromeInfinitesimal(value)
}

// 检查是否为回文质数
export function isPalindromePrime(value) {
  return _.isPalindromePrime(value)
} 