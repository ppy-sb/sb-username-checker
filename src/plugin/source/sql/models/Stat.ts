import { SQLSource } from '../index'
import { SQLUserInfo } from '../squelize-models/SQLUserInfo'
import Base from './Base'
export default class UserInfoWrapper extends Base<SQLUserInfo> {
  before

  constructor (doc: SQLUserInfo, db: SQLSource) {
    super(doc, db)
    this.before = this.toJSON()
  }

  toJSON () {
    const {
      id,
      name,
      safeName,
      email,
      banned
    } = this
    return {
      id,
      name,
      safeName,
      email,
      banned
    }
  }

  get id () {
    return this._original.id
  }

  set id (value) {
    this._original.id = value
  }

  get name () {
    return this._original.name
  }

  set name (value) {
    this._original.name = value
  }

  get safeName () {
    return this._original.safe_name
  }

  set safeName (value) {
    this._original.safe_name = value
  }

  get email () {
    return this._original.email
  }

  get banned (): boolean {
    return Boolean(!(this._original.priv & 1 << 0))
  }

  set banned (ban) {
    if (ban) {
      this._original.priv = this._original.priv & ~(1 << 0)
    } else {
      this._original.priv = this._original.priv & 1 << 0
    }
  }

  ban () {
    this.banned = true
  }

  unban () {
    this.banned = false
  }
}
