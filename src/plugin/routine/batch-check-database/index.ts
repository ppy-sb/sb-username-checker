import { USBC } from 'app'
import { DatabaseUserHoldingNames, DatabaseUserStat } from 'types/source'
// @ts-expect-error no d.ts
import Confirm from 'prompt-confirm'
export class BatchChecker {
  _ctx: USBC

  rejected: DatabaseUserHoldingNames[] = []
  approved: DatabaseUserHoldingNames[] = []
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
    await Promise.all(users.map(async checkName => {
      if (!checkName) return
      const { rejected } = await this._ctx.check(checkName)

      if (rejected) { this.rejected.push(checkName) } else { this.approved.push(checkName) }
    }))
  }

  confirm () {
    return this._confirm()
  }

  async removeInappropriateChars () {
    for (const checkName of this.rejected) {
      await this._ctx.justify(checkName)
    }
  }

  async printTable () {
    const table = this.rejected.map(checkName => ({
      id: checkName.id,
      name: checkName.name,
      safeName: checkName.safeName,
      'reject reason': checkName.rejectReason
    }))
    console.log('test positives:')
    console.table(table, ['id', 'name', 'safeName', 'reject reason'])
    console.log('commits in username:')
    console.table(
      this.rejected.reduce((acc: Array<{
        index: number,
        name: string,
        commit: string,
        field: string,
        content: string
      }>, checkName) => {
        const commits = checkName.changes()
        // return { checkName, commits }
        acc.push(...commits.map(commit => {
          return {
            index: checkName.id,
            name: checkName.name,
            commit: commit.op,
            field: commit.field.join('.'),
            content: `${commit.before} -> ${commit.after}`
          }
        }))
        return acc
      }, []), ['index', 'name', 'commit', 'field', 'content']
    )
    const commit: { index: number; name: string; commit: string; content: string, field: string }[] = []
    await Promise.all(this.rejected.map(async checkName => {
      const info = await checkName.getStat()
      if (!info) return
      const commits = await info?.changes() || []
      commit.push(...commits.map(commit => {
        return {
          index: checkName.id,
          name: checkName.name,
          commit: commit.op,
          field: commit.field.join('.'),
          content: `${commit.before} -> ${commit.after}`
        }
      }))
    }))
    console.log('commits in checkName stat:')
    console.table(commit, ['index', 'name', 'commit', 'field', 'content'])
    // console.log()
  }

  async commitToSource () {
    if (!this._ctx.database) return
    if (!this._ctx.database.isDatabase) return
    await this._ctx.database.updateUserHoldingNames(this.approved)
    await this._ctx.database.updateUserHoldingNames(this.rejected)
    const active = await Promise.all(
      this.rejected.filter(checkName => checkName.active)
        .map(checkName => checkName.getStat())
    )
    const activeUsernames = active.filter((checkName): checkName is DatabaseUserStat => !!checkName)
    await this._ctx.database?.updateUsers(activeUsernames)
  }
}

export default function BatchCheckerPlugin (ctx: USBC) {
  ctx.useApplication(async ctx => {
    const batchChecker = new BatchChecker(ctx)
    await batchChecker.runCheckers()
    await batchChecker.removeInappropriateChars()
    try {
      const commit = await batchChecker.confirm()
      if (commit) {
        await batchChecker.commitToSource()
      }
    } catch (error: unknown) {
      if (error instanceof Error) console.error(error?.message)
    }
  })
}
