import { Model, DataTypes, CreationOptional } from 'sequelize'
import { SQLSource } from '../index'
export class SQLUserHoldingNames extends Model {
  declare _id: CreationOptional<number>
  declare id: number
  declare name: string
  declare name_safe: string
  declare is_active: boolean
  declare inappropriate_check_date: Date
  declare inappropriate_checker_version: number
  declare create_time: number
  declare reject_reason: string
}

export function init (source: SQLSource) {
  if (!source._db) return
  SQLUserHoldingNames.init({
    _id: { type: DataTypes.INTEGER, primaryKey: true },
    id: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING },
    name_safe: { type: DataTypes.STRING },
    is_active: { type: DataTypes.BOOLEAN },
    inappropriate_checker_version: {
      type: DataTypes.INTEGER.ZEROFILL,
      defaultValue: 0,
      allowNull: false
    },
    create_time: { type: DataTypes.INTEGER },
    reject_reason: { type: DataTypes.STRING }
  }, {
    sequelize: source._db,
    modelName: 'UsingNames',
    tableName: source._options.table.history || 'name_legality',
    createdAt: false,
    updatedAt: 'inappropriate_check_date'
  })
}
