import { USBC } from 'app'
import { DatabaseUserHoldingNames, DatabaseUserStat } from 'types/source'
// @ts-expect-error no d.ts
import Confirm from 'prompt-confirm'
import { inspect } from 'util'
import { table } from 'table'
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

  async runModifiers () {
    for (const checkName of this.rejected) {
      await this._ctx.justify(checkName)
      if (!checkName.rejected) {
        this.approved.push(checkName)
      }
    }
    this.rejected = this.rejected.filter(checkName => checkName.rejected)
  }

  async sealUsers () {
    for (const checkName of this.rejected) {
      await this._ctx.seal(checkName)
    }
  }

  async printTable () {
    const positives = this.rejected.map(checkName => [
      inspect(checkName.id, { colors: true }),
      checkName.before.name,
      checkName.before.safeName,
      checkName.rejectReason
    ])

    console.log(
      table(
        [
          ['id', 'name', 'safeName', 'reject reason'],
          ...positives
        ],
        {
          header: {
            alignment: 'center',
            content: 'Positives'
          },
          columns: [
            { alignment: 'right' }
          ]
        }
      )
    )

    const usernameCommits = this.rejected.reduce((acc: Array<{
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
          name: checkName.before.name,
          commit: commit.op,
          field: commit.field.join('.'),
          content: `${inspect(commit.before, { colors: true })} -> ${inspect(commit.after, { colors: true })}`
        }
      }))
      return acc
    }, []).map(checkName => [
      inspect(checkName.index, { colors: true }),
      checkName.name,
      checkName.commit,
      checkName.field,
      checkName.content
    ])

    console.log(
      table(
        [
          ['index', 'name', 'commit', 'field', 'content'],
          ...usernameCommits
        ],
        {
          header: {
            alignment: 'center',
            content: 'commits in username'
          },
          columns: [
            { alignment: 'right' }
          ]
        }
      )
    )

    const commit: { index: number; name: string; commit: string; content: string, field: string }[] = []
    await Promise.all(this.rejected.map(async checkName => {
      const info = await checkName.getStat()
      if (!info) return
      const commits = await info?.changes() || []
      commit.push(...commits.map(commit => {
        return {
          index: checkName.id,
          name: checkName.before.name,
          commit: commit.op,
          field: commit.field.join('.'),
          content: `${inspect(commit.before, { colors: true })} -> ${inspect(commit.after, { colors: true })}`
        }
      }))
    }))

    console.log(
      table(
        [
          ['index', 'name', 'commit', 'field', 'content'],
          ...commit.map(commit => [
            inspect(commit.index, { colors: true }),
            commit.name,
            commit.commit,
            commit.field,
            commit.content]
          )
        ],
        {
          header: {
            alignment: 'center',
            content: 'commits in checkName stat'
          },
          columns: [
            { alignment: 'right' }
          ]
        }
      )
    )
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
    await batchChecker.sealUsers()
    await batchChecker.runModifiers()
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
