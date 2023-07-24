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
      const duplicate = old.find(res =>
        res.field === head?.field &&
        res.positive === head.positive &&
        res.index === head.index
      )

      if (!duplicate) {
        check.checkResult.push(head)
      } else {
        duplicate.tags = [...new Set(head.tags.concat(duplicate.tags))]
      }
    }
  })
}
