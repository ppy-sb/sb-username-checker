import { Callback, AppCallback, Config, Plugin } from 'types/useable'
import { Database, UserHoldingNames, DatabaseUserHoldingNames } from 'types/source'
import { SearchParams } from 'plugin/config'
// import EventEmitter from 'events'

class Base {
  _version = 0
  _searchParams: SearchParams = {
    version: {
      $gte: this._version
    }
  }

  _checker: Callback[] = []
  _modifier: Callback[] = []
  _configurator: AppCallback[] = []
  _app: AppCallback[] = []
  database?: Database = undefined
  _installed: Map<string | symbol, Callback | AppCallback> = new Map()

  async check (user: UserHoldingNames | DatabaseUserHoldingNames) {
    for (const checker of this._checker) {
      await checker(user)
    }
    return user
  }

  async justify (user: UserHoldingNames | DatabaseUserHoldingNames) {
    for (const mod of this._modifier) {
      await mod(user)
    }
  }

  async seal (user: UserHoldingNames | DatabaseUserHoldingNames) {
    user.seal()
  }
}

export class USBC extends Base {
  _current: string | symbol = ''

  register (name: string | symbol) {
    this._current = name
  }

  async use<T extends Plugin> (plugin: T, options?: Config<T>): Promise<void> {
    this._current = plugin.name || Symbol('plugin:' + plugin.name)
    const rtn = await plugin(this, options)
    return rtn
  }

  useConfig (application: AppCallback) {
    this._configurator.push(application)
  }

  useChecker (checker: Callback) {
    this._checker.push(checker)
  }

  useDatabase (database: Database) {
    this.database = database
  }

  useModifier (modifier: Callback) {
    this._modifier.push(modifier)
  }

  useApplication (application: AppCallback) {
    this._app.push(application)
  }
}

export class App extends USBC {
  async start () {
    // if (this.source) await this.source.start()
    if (this.database) await this.database.start()
  }

  async run () {
    for (const app of this._app) {
      await app(this)
    }
  }

  clone () {
    const copy = new App()
      ;['_checker', '_modifier', '_configurator', '_app'].forEach((key: string) => {
      // @ts-expect-error you don't understand.
      copy[key] = [...this[key]]
    })
    copy._searchParams = JSON.parse(JSON.stringify(this._searchParams))
    copy._version = this._version
    copy.database = this.database
    copy._installed = new Map(this._installed)
    return copy
  }
}
