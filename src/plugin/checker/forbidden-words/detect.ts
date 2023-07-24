import { getAllIndexes } from './utils/match'
import { UserHoldingNames, DatabaseUserHoldingNames, CheckResult } from 'types/source'
import { Opt } from '.'

export function detect (check: UserHoldingNames | DatabaseUserHoldingNames, opt: Opt, field: CheckResult['field']) {
  const { forbidden, tag, ignoreCase = true, spaced = false } = opt
  let name: string

  if ('name' in check && field === 'name') {
    name = check.name
  } else if ('safeName' in check && field === 'safeName') {
    name = check.safeName
  }
  return forbidden.map(forbiddenWord => {
    const indexes = getAllIndexes(name, forbiddenWord, ignoreCase, spaced)
    if (!indexes.length) {
      return false
    }
    indexes.forEach((index) => check.reject({
      field,
      index,
      length: forbiddenWord.length,
      positive: forbiddenWord,
      message: 'forbidden word: ' + forbiddenWord,
      tags: [tag || 'ForbiddenWordsChecker']
    }))
    return true
  })
}
