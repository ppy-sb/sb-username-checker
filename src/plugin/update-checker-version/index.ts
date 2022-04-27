import { USBC } from 'app'

export default function UpdateVersionPlugin (ctx: USBC) {
  ctx.useModifier(checkName => {
    if (!checkName.isDatabase) return
    checkName.checkerVersion = ctx._version
  })
}
