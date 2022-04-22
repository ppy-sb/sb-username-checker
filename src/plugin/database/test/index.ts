/* eslint-disable @typescript-eslint/no-empty-function */
import { Database, User } from 'types/database'
import { USBC } from 'app'
class TestDatabase implements Database {
  async fetchAllUserNameHistories () {
    const users = await (await import('./fakeusers')).default()
    return users as unknown as User[]
  }

  approve (users: User[]) {
    users.forEach(user => console.info('approved', user.name))
  }

  reject (users: User[]) {
    users.forEach(user =>
      console.info('rejected', user.name, 'reason:', user._rejectReason.join(', '))
    )
  }

  start () {}
  stop () {}
}
export default function TestDatabasePlugin (ctx: USBC) {
  ctx.useDatabase(new TestDatabase())
}
