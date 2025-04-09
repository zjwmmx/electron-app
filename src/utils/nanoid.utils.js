import { customAlphabet } from 'nanoid'
const letters = 'abcdefghijklmnopqrstuvwsyz'
const letter = customAlphabet(`${letters}`, 15)
const letterAndNumber = customAlphabet(`0123456789${letters}`, 15)
export const nanoid = (len = 20) => {
  const prefix = letter(1)
  return prefix + letterAndNumber(len - 1)
}
