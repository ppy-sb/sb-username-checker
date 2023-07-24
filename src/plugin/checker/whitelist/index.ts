import { USBC } from 'app'

export default function createWhitelist (ctx: USBC, options: string[]) {
  ctx.useModifier((user) => {
    if (!user.checkResult.length) {
      return
    }
    user.checkResult = user.checkResult.filter(rej =>
      !options.includes(rej.positive)
    )
    if (!user.checkResult.length) {
      user.rejected = false
    }
  })
}
