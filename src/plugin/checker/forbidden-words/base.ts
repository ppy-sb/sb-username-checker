import { USBC } from 'app'
export interface Options {
  forbidden: string[],
  splitter: string
}

export default function TestCheckerPlugin (ctx: USBC, options: Options) {
  const { forbidden } = options
  ctx.useChecker(function testChecker (user) {
    const violated: Partial<Record<string, string>> = {
      name: undefined,
      nameSafe: undefined
    }
    const nameViolation = forbidden.some(forbiddenWord => {
      const index = user.name.indexOf(forbiddenWord)
      const contains = index !== -1
      if (!contains) { return false }
      user.checkResult.name?.push({
        index,
        length: forbiddenWord.length,
        positive: forbiddenWord
      })
      violated.name = forbiddenWord
      return true
    })
    if (nameViolation) {
      user.reject('name includes: ' + violated.name)
    }
    if (user.isDatabase) {
      const nameSafeViolation = forbidden.some(forbiddenWord => {
        const index = user.name_safe.indexOf(forbiddenWord)
        const contains = index !== -1
        if (!contains) { return false }
        user.checkResult.name?.push({
          index,
          length: forbiddenWord.length,
          positive: forbiddenWord
        })
        violated.nameSafe = forbiddenWord
        return true
      })
      if (nameSafeViolation) {
        user.reject('name_safe includes: ' + violated.nameSafe)
      }
      if (!nameViolation && !nameSafeViolation) {
        user.approve()
      }
      return
    }
    if (!nameViolation) {
      user.approve()
    }
  })
}
