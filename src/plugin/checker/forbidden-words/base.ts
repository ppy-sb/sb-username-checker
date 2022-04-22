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
      const contains = user.name.includes(forbiddenWord)
      if (!contains) { return false }
      user._checkResult.name?.push(forbiddenWord)
      violated.name = forbiddenWord
      return true
    })
    const nameSafeViolation = forbidden.some(forbiddenWord => {
      const contains = user.name_safe.includes(forbiddenWord)
      if (!contains) { return false }
      user._checkResult.nameSafe?.push(forbiddenWord)
      violated.nameSafe = forbiddenWord
      return true
    })
    if (nameViolation) {
      user.reject('name contains forbidden word: ' + violated.name)
    }
    if (nameSafeViolation) {
      user.reject('name_safe contains forbidden word: ' + violated.nameSafe)
    }
    if (!nameViolation && !nameSafeViolation) {
      user.approve()
    }
  })
}
