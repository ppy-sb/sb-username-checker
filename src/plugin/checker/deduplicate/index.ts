import { USBC } from 'app'
import { CheckResult } from 'types/source'

export default function Deduplicate (ctx: USBC) {
  ctx.useModifier(function RemoveDuplicate (check) {
    const old = check.checkResult
    check.checkResult = []
    let head: CheckResult | undefined
    // eslint-disable-next-line no-cond-assign
    while (head = old.pop()) {
      if (!head) {
        return
      }
      if (!old.find(res => res.field === head?.field && res.positive === head.positive && res.index === head.index)) {
        check.checkResult.push(head)
      }
    }
  })
}
