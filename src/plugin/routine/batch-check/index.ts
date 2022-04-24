import { USBC } from 'app'
import { DatabaseUserHoldingNames, DatabaseUserStat } from 'types/source'
// @ts-expect-error no d.ts
import Confirm from 'prompt-confirm'
export class BatchChecker {
  _ctx: USBC

  _rejected: DatabaseUserHoldingNames[] = []
  _approved: DatabaseUserHoldingNames[] = []
  _confirm: () => Promise<boolean>

  constructor (ctx: USBC) {
    this._ctx = ctx
    this._confirm = async () => {
      await this.printTable()
      const prompt = new Confirm('commit to database?')
      return prompt.run()
      // return false
    }
  }

  async runCheckers () {
    if (!this._ctx.database) return
    if (!this._ctx.database.isDatabase) return
    const users = await this._ctx.database.fetchAllUserHoldingNames(this._ctx._searchParams)
    await Promise.all(users.map(async user => {
      if (!user) return
      const res = await Promise.all(this._ctx._checker.map(async checker => {
        await checker(user)
        return user._rejected
      }))
      const rejected = res.every(r => r)

      if (rejected) { this._rejected.push(user) } else { this._approved.push(user) }
    }))
  }

  confirm () {
    return this._confirm()
  }

  async removeinappropriateChars () {
    // return Promise.all(this._rejected.map(
    //   user => Promise.all(this._ctx._modifier.map(mod => mod(user)))
    // ))
    for (const user of this._rejected) {
      for (const mod of this._ctx._modifier) {
        await mod(user)
      }
    }
  }

  async printTable () {
    const table = this._rejected.map(user => ({
      id: user.id,
      name: user.name,
      name_safe: user.name_safe,
      // 'reject reason': user._rejectReason.join('; '),
      'reject reason': user.reject_reason,
      'test positives': Object.entries(user._checkResult).map(([type, positives]) => {
        return `${type}: ${positives.join(', ')}`
      }).join('; ')
    }))
    console.log('test positives:')
    console.table(table, ['id', 'name', 'name_safe', 'reject reason', 'test positives'])
    console.log('commits in username:')
    console.table(
      this._rejected.reduce((acc: any, user) => {
        const commits = user.changes()
        // return { user, commits }
        acc.push(...commits.map(commit => {
          return {
            index: user.id,
            name: user.name,
            commit: commit.op,
            field: commit.field.join('.'),
            content: `${commit.before} -> ${commit.after}`
          }
        }))
        return acc
      }, []), ['index', 'name', 'commit', 'field', 'content']
    )
    const commit: { index: number; name: string; commit: string; content: string, field: string }[] = []
    await Promise.all(this._rejected.map(async user => {
      const info = await user.getStat()
      if (!info) return
      const commits = await info?.changes() || []
      commit.push(...commits.map(commit => {
        return {
          index: user.id,
          name: user.name,
          commit: commit.op,
          field: commit.field.join('.'),
          content: `${commit.before} -> ${commit.after}`
        }
      }))
    }))
    console.log('commits in user stat:')
    console.table(commit, ['index', 'name', 'commit', 'field', 'content'])
    // console.log()
  }

  async commitToSource () {
    if (!this._ctx.database) return
    if (!this._ctx.database.isDatabase) return
    await this._ctx.database.updateUserHoldingNames(this._approved)
    await this._ctx.database.updateUserHoldingNames(this._rejected)
    const active = await Promise.all(
      this._rejected.filter(user => user.is_active)
        .map(user => user.getStat())
    )
    const activeUsernames = active.filter((user): user is DatabaseUserStat => !!user)
    await this._ctx.database?.updateUsers(activeUsernames)
  }
}

export default function BatchCheckerPlugin (ctx: USBC) {
  ctx.useApplication(async ctx => {
    const batchChecker = new BatchChecker(ctx)
    await batchChecker.runCheckers()
    await batchChecker.removeinappropriateChars()
    try {
      const commit = await batchChecker.confirm()
      if (!commit) {
        return
      }
      await batchChecker.commitToSource()
    } catch (error: any) {
      console.error(error.message)
    }
    // await this._ctx.database?.stop()
  })
}
