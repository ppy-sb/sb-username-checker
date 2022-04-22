import { Plugin, Config, Checker } from 'types/useable'
import { Database, User } from 'types/database'
import { SearchParams } from './Config'

class Base {
  _version = 0
  _searchParams: SearchParams = {
    version: {
      $gte: this._version
    }
  }

  _rejected: User[] = []
  _approved: User[] = []
  _checker: Checker[] = []
  _modifier: Checker[] = []
  _database?: Database = undefined
}

export class USBC extends Base {
  async use<T extends Plugin> (plugin: T, options?: Config<T>) {
    await plugin(this, options)
  }

  useChecker (checker: Checker) {
    this._checker.push(checker)
  }

  useDatabase (database: Database) {
    this._database = database
  }

  useModifier (modifier: Checker) {
    this._modifier.push(modifier)
  }
}

export class App extends USBC {
  async run () {
    await this._database?.start()
    await this.#runCheckers()
    await this.#removeinappropriateChars()
    await this.#commitToDatabase()
    await this._database?.stop()
  }

  async #runCheckers () {
    if (!this._database) return
    const users = await this._database.fetchUsers(this._searchParams)
    users.forEach(user => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      user.approve = () => {}
      user.reject = (reason: string) => {
        user._rejected = true
        user._rejectReason.push(reason)
      }
      const rejected = this._checker.every(checker => {
        checker(user)
        return user._rejected
      })
      if (rejected) { this._rejected.push(user) } else { this._approved.push(user) }
    })
  }

  async #removeinappropriateChars () {
    return await Promise.all(this._rejected.map(
      user => this._modifier.map(mod => mod(user))
    ))
  }

  async #commitToDatabase () {
    await this._database?.approve(this._approved)
    await this._database?.reject(this._rejected)
  }
}
