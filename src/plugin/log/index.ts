import { USBC } from 'app'

export default function LogModifiy (ctx: USBC) {
  ctx.useModifier(() => {
    const table = ctx._rejected.map(user => ({
      id: user.id,
      name: user.name,
      name_safe: user.name_safe,
      'reject reason': user._rejectReason,
      positives: user._checkResult
    }))
    console.table(table)
  })
}
