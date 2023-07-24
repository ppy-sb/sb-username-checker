import { USBC } from 'app'
import { Options } from './type'
import { detect } from './detect'

export interface Opt extends Pick<Options, 'forbidden' | 'tag' | 'ignoreCase' | 'spaced'>{}
export default function ForbiddenWordsCheckerPlugin (ctx: USBC, options: Opt) {
  const { ignoreCase = true } = options
  // ignore case
  if (ignoreCase) {
    options.forbidden = [...new Map(options.forbidden.map(val => [val.toLowerCase(), val])).values()]
  }

  ctx.useChecker(function ForbiddenWordsChecker (check) {
    const curried = detect.bind(null, check, options)
    const nameViolation = curried('name')

    if (check.isDatabase) {
      const safeNameViolation = curried('safeName')
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
