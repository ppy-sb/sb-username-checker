import { Callback, AppCallback, Config, Plugin } from 'types/useable'
import { Database } from 'types/source'
import { SearchParams } from '../plugin/config'
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
  _app: AppCallback[] = []
  // source?: Source = undefined
  database?: Database = undefined
  _installed: Map<string |symbol, Callback | AppCallback> = new Map()
}

export class USBC extends Base {
  _current: string | symbol = ''
  // _emitter: EventEmitter = new EventEmitter()
  // emit (eventName: string | symbol, ...rest: any[]) {
  //   return this._emitter.emit(eventName, ...rest)
  // }

  // on (eventName: string | symbol, listener: (...args: any[]) => void) {
  //   return this._emitter.on(eventName, listener)
  // }

  // once (eventName: string | symbol, listener: (...args: any[]) => void) {
  //   return this._emitter.once(eventName, listener)
  // }

  // off (eventName: string | symbol, listener: (...args: any[]) => void) {
  //   return this._emitter.off(eventName, listener)
  // }

  register (name: string | symbol) {
    this._current = name
  }

  async use<T extends Plugin> (plugin: T, options?: Config<T>): Promise<ReturnType<T>> {
    this._current = plugin.name || Symbol('plugin:' + plugin.name)
    const rtn = await plugin(this, options)
    return rtn
  }

  // async with(plugin: string | string[], plugin) {

  // }

  useChecker (checker: Callback) {
    this._checker.push(checker)
  }

  // useSource (source: Source) {
  //   this.source = source
  // }

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
}
