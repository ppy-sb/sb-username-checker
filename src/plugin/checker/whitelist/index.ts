import { type USBC } from 'app'
import { DatabaseUserHoldingNames } from 'types/source'

export default function createWhitelist (ctx: USBC, options: string[]) {
  options = options.map(opt => opt.toLowerCase())
  ctx.useChecker((user) => {
    if (!user.checkResult.length) {
      return
    }

    user.checkResult = user.checkResult.filter(rej => {
      const name = 'field' in rej && rej.field === 'name' ? user.name : (user as DatabaseUserHoldingNames).safeName
      const before = name.slice(0, rej.index + rej.length).toLowerCase()
      const after = name.slice(rej.index).toLowerCase()

      return options.every(opt => {
        opt = opt.toLowerCase()
        return !before.endsWith(opt) &&
        !after.startsWith(opt) &&
        rej.positive !== opt
      })
    })

    if (!user.checkResult.length) {
      user.rejected = false
    }
  })
}
