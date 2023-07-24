import { USBC } from 'app'

export default function createWhitelist (ctx: USBC, options: string[]) {
  options = options.map(opt => opt.toLowerCase())
  ctx.useModifier((user) => {
    if (!user.checkResult.length) {
      return
    }
    user.checkResult = user.checkResult.filter(rej =>
      options.every(opt => !opt.includes(rej.positive.toLowerCase()))
    )
    if (!user.checkResult.length) {
      user.rejected = false
    }
  })
}
