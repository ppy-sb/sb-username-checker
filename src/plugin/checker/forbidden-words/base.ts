import { USBC } from 'app'
export interface Options {
  forbidden: string[],
  splitter: string
}

export default function TestCheckerPlugin (ctx: USBC, options: Options) {
  const { forbidden } = options
  ctx.useChecker(function testChecker (check) {
    const nameViolation = forbidden.some(forbiddenWord => {
      const index = check.name.indexOf(forbiddenWord)
      const contains = index !== -1
      if (!contains) { return false }
      check.reject({
        field: 'name',
        index,
        length: forbiddenWord.length,
        positive: forbiddenWord,
        message: 'forbidden word: ' + forbiddenWord
      })
      return true
    })
    if (check.isDatabase) {
      const nameSafeViolation = forbidden.some(forbiddenWord => {
        const index = check.safeName.indexOf(forbiddenWord)
        const contains = index !== -1
        if (!contains) { return false }
        check.reject({
          field: 'safeName',
          index,
          length: forbiddenWord.length,
          positive: forbiddenWord,
          message: 'forbidden word:: ' + forbiddenWord
        })
        return true
      })
      if (!nameViolation && !nameSafeViolation) {
        check.approve()
      }
      return
    }
    if (!nameViolation) {
      check.approve()
    }
  })
}
