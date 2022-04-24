/* eslint-disable @typescript-eslint/no-empty-function */
import { Source, UserHoldingNames } from 'types/source'
import { USBC } from 'app'
class TestSource implements Source {
  async fetchAllUserHoldingNames () {
    const users = await (await import('./fakeusers')).default()
    return users as unknown as UserHoldingNames[]
  }

  approve (users: UserHoldingNames[]) {
    users.forEach(user => console.info('approved', user.name))
  }

  reject (users: UserHoldingNames[]) {
    users.forEach(user =>
      console.info('rejected', user.name, 'reason:', user._rejectReason.join(', '))
    )
  }

  start () {}
  stop () {}
}
export default function TestSourcePlugin (ctx: USBC) {
  ctx.useSource(new TestSource())
}
