/* eslint-disable camelcase */
// declare is_active: boolean
// declare inappropriate_check_date: Date
// declare inappropriate_checker_version: number
// declare create_time: number
// declare reject_reason: string

// is_active, inappropriate_check_date, inappropriate_checker_version, create_time,
// _rejected, _rejectReason, reject_reason, _checkResult
import { SQLUserHoldingNames, SQLSource } from '../index'
import { DatabaseUserHoldingNames, CheckResult } from 'types/source'
import Wrapper from './Base'
export default class HoldingNamesWrapper extends Wrapper<SQLUserHoldingNames> implements DatabaseUserHoldingNames {
  _before: unknown
  _rejected = false
  _rejectReason: string[] = []
  _checkResult: {
    name: CheckResult[],
    nameSafe: CheckResult[]
  } = {
      name: [],
      nameSafe: []
    }

  constructor (doc: SQLUserHoldingNames, db: SQLSource) {
    super(doc, db)
    this._before = this.toJSON()
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  approve () {}
  reject (reason: string) {
    this._rejected = true
    this._rejectReason.push(reason)
    this.reject_reason = this._rejectReason.join('\n')
  }

  getStat () {
    return this._db.fetchUserStats({ id: this.id })
  }

  toJSON () {
    const {
      _id,
      id,
      name,
      name_safe,
      is_active,
      reject_reason,
      inappropriate_check_date,
      inappropriate_checker_version,
      create_time
    } = this
    return {
      _id,
      id,
      name,
      name_safe,
      is_active,
      reject_reason,
      inappropriate_check_date,
      inappropriate_checker_version,
      create_time
    }
  }

  get _id () {
    return this._original._id
  }

  set _id (value) {
    this._original.id = value
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
    return this._original.name_safe
  }

  set name_safe (value) {
    this._original.name_safe = value
  }

  get is_active () {
    return this._original.is_active
  }

  set is_active (value) {
    this._original.is_active = value
  }

  get reject_reason () {
    return this._original.reject_reason
  }

  set reject_reason (value) {
    this._original.reject_reason = value
  }

  // get _rejectReason () {
  //   this.reject_reason = this.#rejectReason.join('\n')
  //   return this.#rejectReason
  // }

  // set _rejectReason (value) {
  //   this.#rejectReason = value
  //   this.reject_reason = value.join('\n')
  // }

  get inappropriate_check_date () {
    return this._original.inappropriate_check_date
  }

  set inappropriate_check_date (value) {
    this._original.inappropriate_check_date = value
  }

  get inappropriate_checker_version () {
    return this._original.inappropriate_checker_version
  }

  set inappropriate_checker_version (value) {
    this._original.inappropriate_checker_version = value
  }

  get create_time () {
    return this._original.create_time
  }

  set create_time (value) {
    this._original.create_time = value
  }
}
