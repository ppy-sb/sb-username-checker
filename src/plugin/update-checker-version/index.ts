import { USBC } from 'app'

export default function UpdateVersionPlugin (ctx: USBC) {
  ctx.useModifier(user => {
    if (!user.isDatabase) return
    user.inappropriate_checker_version = ctx._version
  })
}
