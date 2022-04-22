import { USBC } from 'app'

export default function LogModifiy (ctx: USBC) {
  ctx.useModifier(() => {
    const table = ctx._rejected.map(user => ({
      id: user.id,
      name: user.name,
      name_safe: user.name_safe,
      'reject reason': user._rejectReason.join('\n'),
      'test positives': Object.entries(user._checkResult).map(([type, positives]) => {
        return `${type}: ${positives.join(', ')}`
      }).join('\n')
    }))
    console.table(table)
  })
}
