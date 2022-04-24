/* eslint-disable camelcase */
import { SQLUserInfo, SQLSource } from '../index'
import Base from './Base'
export default class UserInfoWrapper extends Base<SQLUserInfo> {
  _before: unknown

  constructor (doc: SQLUserInfo, db: SQLSource) {
    super(doc, db)
    this._before = this.toJSON()
  }

  toJSON () {
    const {
      id,
      name,
      name_safe,
      email,
      banned
    } = this
    return {
      id,
      name,
      name_safe,
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

  get name_safe () {
    return this._original.safe_name
  }

  set name_safe (value) {
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
