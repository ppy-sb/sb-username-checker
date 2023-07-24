import { USBC } from 'app'
import { CheckResult } from 'types/source'
export interface Options {
  forbidden: string[],
  separator: string
  whitelisted: string[],
  name?: string
}

function getAllIndexes (arr: string, val: string) {
  const indexes = []; let i = -1
  while ((i = arr.indexOf(val, i + 1)) !== -1) {
    indexes.push(i)
  }
  return indexes
}

export default function ForbiddenWordsCheckerPlugin (ctx: USBC, options: Pick<Options, 'forbidden' | 'name'>) {
  const { forbidden, name } = options
  ctx.useChecker(function ForbiddenWordsChecker (check) {
    const nameViolation = forbidden.map(forbiddenWord => {
      const indexes = getAllIndexes(check.name, forbiddenWord)
      if (!indexes.length) {
        return false
      }
      indexes.forEach((index) => check.reject({
        field: 'name',
        index,
        length: forbiddenWord.length,
        positive: forbiddenWord,
        message: 'forbidden word: ' + forbiddenWord,
        markedBy: { name: name || ForbiddenWordsChecker.name }
      }))
      return true
    })

    if (check.isDatabase) {
      const safeNameViolation = forbidden.map(forbiddenWord => {
        const indexes = getAllIndexes(check.name, forbiddenWord)
        if (!indexes.length) {
          return false
        }
        indexes.forEach((index) => check.reject({
          field: 'safeName',
          index,
          length: forbiddenWord.length,
          positive: forbiddenWord,
          message: 'forbidden word: ' + forbiddenWord,
          markedBy: { name: name || ForbiddenWordsChecker.name }
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

  ctx.useModifier(function RemoveDuplicate (check) {
    const old = check.checkResult
    check.checkResult = []
    let head: CheckResult | undefined
    // eslint-disable-next-line no-cond-assign
    while (head = old.pop()) {
      if (!head) {
        return
      }
      if (!old.find(res => res.field === head?.field && res.positive === head.positive && res.index === head.index)) {
        check.checkResult.push(head)
      }
    }
  })
}
