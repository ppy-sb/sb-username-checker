import { Model, DataTypes } from 'sequelize'
import { SQLSource } from '../index'
export class SQLUserInfo extends Model {
  declare id: number
  declare name: string
  declare safe_name: string
  declare email: string
  declare banned: boolean
  declare priv: number
}

export function init (source: SQLSource) {
  if (!source._db) return
  SQLUserInfo.init({
    id: { type: DataTypes.INTEGER, primaryKey: true },
    name: { type: DataTypes.STRING },
    safe_name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    priv: { type: DataTypes.INTEGER }
  }, {
    sequelize: source._db,
    modelName: 'UserStat',
    createdAt: false,
    updatedAt: false,
    tableName: source._options.table.stat || 'users'
  })
}
