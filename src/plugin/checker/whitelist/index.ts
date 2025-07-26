import { type USBC } from 'app'
import { DatabaseUserHoldingNames } from 'types/source'

export default function createWhitelist (ctx: USBC, options: string[]) {
  options = options.map(opt => opt.toLowerCase())
  ctx.useModifier((user) => {
    if (!user.checkResult.length) {
      return
    }

    user.checkResult = user.checkResult.filter(rej => {
      const name = 'field' in rej && rej.field === 'name' ? user.name : (user as DatabaseUserHoldingNames).safeName
      const before = name.slice(0, rej.index + rej.length)
      const after = name.slice(rej.index)

      return options.every(opt => !before.toLowerCase().endsWith(opt) && !after.toLowerCase().startsWith(opt))
    })

    if (!user.checkResult.length) {
      user.rejected = false
    }
  })
}
