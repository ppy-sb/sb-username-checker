import { Model } from 'sequelize'
import compare from '../utils/compare'
import { SQLSource } from '../index'

export default abstract class ModelWrapper<T extends Model> {
  _original: T
  _db: SQLSource
  abstract _before: unknown
  isDatabase: true = true

  constructor (stat: T, db: SQLSource) {
    this._original = stat
    this._db = db
  }

  abstract toJSON(): unknown

  changes () {
    const now = this.toJSON()
    return compare(this._before, now)
  }

  async save () {
    await this._original.save()
    return this
  }
}
