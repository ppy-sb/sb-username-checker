import { SQLUserInfo } from './index'
export default class UserInfoWrapper {
  #user: SQLUserInfo

  constructor (stat: SQLUserInfo) {
    this.#user = stat
  }

  get id () {
    return this.#user.id
  }

  set id (value) {
    this.#user.id = value
  }

  get name () {
    return this.#user.name
  }

  set name (value) {
    this.#user.name = value
  }

  get name_safe () {
    return this.#user.safe_name
  }

  set name_safe (value) {
    this.#user.safe_name = value
  }

  get email () {
    return this.#user.email
  }

  get banned (): boolean {
    return Boolean(this.#user.priv & 1 << 0)
  }

  set banned (ban) {
    if (ban) {
      this.#user.priv = this.#user.priv & 1 << 0
    } else {
      this.#user.priv = this.#user.priv & ~(1 << 0)
    }
  }

  ban () {
    this.banned = true
  }

  unban () {
    this.banned = false
  }
}
