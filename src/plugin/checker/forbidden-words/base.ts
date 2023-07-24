import { USBC } from 'app'
export interface Options {
  forbidden: string[],
  separator: string
  whitelisted: string[],
  tag?: string,
  ignoreCase?: boolean
}

function getAllIndexes (arr: string, val: string, ignoreCase = true) {
  const indexes = []
  let i = -1

  if (ignoreCase) {
    arr = arr.toLowerCase()
    val = val.toLowerCase()
  }

  while ((i = arr.indexOf(val, i + 1)) !== -1) {
    indexes.push(i)
  }
  return indexes
}

export default function ForbiddenWordsCheckerPlugin (ctx: USBC, options: Pick<Options, 'forbidden' | 'tag' | 'ignoreCase'>) {
  let { forbidden, tag, ignoreCase = true } = options
  // ignore case
  if (ignoreCase) {
    forbidden = [...new Map(forbidden.map(val => [val.toLowerCase(), val])).values()]
  }

  ctx.useChecker(function ForbiddenWordsChecker (check) {
    const nameViolation = forbidden.map(forbiddenWord => {
      const indexes = getAllIndexes(check.name, forbiddenWord, ignoreCase)
      if (!indexes.length) {
        return false
      }
      indexes.forEach((index) => check.reject({
        field: 'name',
        index,
        length: forbiddenWord.length,
        positive: forbiddenWord,
        message: 'forbidden word: ' + forbiddenWord,
        tags: [tag || ForbiddenWordsChecker.name]
      }))
      return true
    })

    if (check.isDatabase) {
      const safeNameViolation = forbidden.map(forbiddenWord => {
        const indexes = getAllIndexes(check.name, forbiddenWord, ignoreCase)
        if (!indexes.length) {
          return false
        }
        indexes.forEach((index) => check.reject({
          field: 'safeName',
          index,
          length: forbiddenWord.length,
          positive: forbiddenWord,
          message: 'forbidden word: ' + forbiddenWord,
          tags: [tag || ForbiddenWordsChecker.name]
        }))
        return true
      })
      if (!nameViolation.includes(true) && !safeNameViolation.includes(true)) {
        check.approve()
      }
      return
    }
    if (!nameViolation.includes(true)) {
      check.approve()
    }
  })
}
