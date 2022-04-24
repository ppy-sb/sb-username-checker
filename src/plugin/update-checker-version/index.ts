import { USBC } from 'app'

export default function UpdateVersionPlugin (ctx: USBC) {
  ctx.useModifier(user => {
    user.inappropriate_checker_version = ctx._version
  })
}
