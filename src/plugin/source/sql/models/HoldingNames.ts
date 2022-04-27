import { SQLSource } from '../index'
import { SQLUserHoldingNames } from '../squelize-models/SQLUserHoldingNames'
import { DatabaseUserHoldingNames, CheckResult } from 'types/source'
import Wrapper from './Base'
export default class HoldingNamesWrapper extends Wrapper<SQLUserHoldingNames> implements DatabaseUserHoldingNames {
  _before
  rejected = false
  checkResult: CheckResult[] = []

  constructor (doc: SQLUserHoldingNames, db: SQLSource) {
    super(doc, db)
    this._before = this.toJSON()
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  approve () {}
  reject (reason: CheckResult) {
    this.rejected = true
    this.checkResult.push(reason)
    this.rejectReason = this.checkResult.map(({ field, message, index, length }) => `${field}[${index}~${index + length}]: ${message}`).join(',\n')
  }

  getStat () {
    return this._db.fetchUserStats({ id: this.id })
  }

  toJSON () {
    const {
      _id,
      id,
      name,
      safeName,
      active,
      rejectReason,
      checkDate,
      checkerVersion,
      createTime
    } = this
    return {
      _id,
      id,
      name,
      safeName,
      active,
      rejectReason,
      checkDate,
      checkerVersion,
      createTime
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

  get safeName () {
    return this._original.name_safe
  }

  set safeName (value) {
    this._original.name_safe = value
  }

  get active () {
    return this._original.is_active
  }

  set active (value) {
    this._original.is_active = value
  }

  get rejectReason () {
    return this._original.reject_reason
  }

  set rejectReason (value) {
    this._original.reject_reason = value
  }

  get checkDate () {
    return this._original.inappropriate_check_date
  }

  set checkDate (value) {
    this._original.inappropriate_check_date = value
  }

  get checkerVersion () {
    return this._original.inappropriate_checker_version
  }

  set checkerVersion (value) {
    this._original.inappropriate_checker_version = value
  }

  get createTime () {
    return this._original.create_time
  }

  set createTime (value) {
    this._original.create_time = value
  }
}
