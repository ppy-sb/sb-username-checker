import { USBC } from 'app'
import { DatabaseUserHoldingNames, Database } from 'types/source'
import { Sequelize, Model, CreationOptional, DataTypes, Options, Op, WhereOptions } from 'sequelize'
import { SearchParams } from 'plugin/config'
import UserInfoWrapper from './models/Stat'
import HoldingNamesWrapper from './models/HoldingNames'

export interface PluginOptions {
  sequelize: Options | string,
  table: {
    history: string,
    stat: string,
  }
}
export class SQLUserInfo extends Model {
  declare id: number
  declare name: string
  declare safe_name: string
  declare email: string
  declare banned: boolean
  declare priv: number
}
// order of InferAttributes & InferCreationAttributes is important.
export class SQLUserHoldingNames extends Model<
  Omit<
    DatabaseUserHoldingNames,
    | 'isDatabase'
    | 'reject'
    | 'approve'
    | 'inappropriate_check_date'
    | 'fetchUserHoldingNames'
    | 'rejected'
    | 'rejectReason'
    | 'checkResult'
    | 'getStat'
    | 'save'
    | 'changes'
    >
  > {
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
export class SQLSource implements Database {
  _db?: Sequelize = undefined
  _options: PluginOptions
  _usbc: USBC
  _relational: Map<string, UserInfoWrapper>
  isDatabase: true

  constructor (ctx: USBC, options: PluginOptions) {
    this.isDatabase = true

    this._usbc = ctx
    // @ts-expect-error d.ts wrong
    this._db = new Sequelize(options.sequelize)
    this._options = options
    this._relational = new Map()
  }

  _modifySearchParams (find: SearchParams): WhereOptions {
    const f:Record<string, Record<string, unknown>> = JSON.parse(JSON.stringify(find))
    Object.values(f).forEach(ops => {
      Object.entries(ops).forEach(([op, value]) => {
        if (!op.startsWith('$')) throw new Error('unsupported op ' + op)
        const opn = op.slice(1)
        // @ts-expect-error it works
        if (!Op[opn]) throw new Error('SQL db do not support op ' + op)
        delete ops[op]
        // @ts-expect-error it works
        ops[Op[opn]] = value
      })
    })
    if (f.version) {
      f.inappropriate_checker_version = f.version
      delete f.version
    }
    if (f.date) {
      f.inappropriate_check_date = f.date
      delete f.date
    }
    return f
  }

  async fetchAllUserHoldingNames (find: SearchParams) {
    const where = this._modifySearchParams(find)
    const names = await SQLUserHoldingNames.findAll({
      where
    })
    const rtn = names.map(user => new HoldingNamesWrapper(user, this))
    return rtn
  }

  fetchUserHoldingNames (find: SearchParams) {
    const where = this._modifySearchParams(find)
    return SQLUserHoldingNames.findOne({
      where
    }).then(res => res && new HoldingNamesWrapper(res, this))
  }

  async fetchUserStats (find: {id: number}): Promise<UserInfoWrapper | null> {
    const cache = this._relational.get(`stat-${find.id}`)
    if (cache) return cache
    const result = await SQLUserInfo.findOne({
      where: find
    })
    if (!result) return null
    const rtn = new UserInfoWrapper(result, this)
    this._relational.set(`stat-${find.id}`, rtn)
    return rtn
  }

  updateUserHoldingNames<HoldingNamesWrapper> (users: HoldingNamesWrapper[]) {
    return Promise.all(users.map(user => {
      // @ts-expect-error it should have save
      return user.save()
    }))
  }

  updateUsers<UserInfoWrapper> (users: UserInfoWrapper[]) {
    // @ts-expect-error it should have save
    return Promise.all(users.map(user => user.save()))
  }

  async start () {
    if (!this._db) return
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
      sequelize: this._db,
      modelName: 'UsingNames',
      tableName: this._options.table.history || 'name_legality',
      createdAt: false,
      updatedAt: 'inappropriate_check_date'
    })
    SQLUserInfo.init({
      id: { type: DataTypes.INTEGER, primaryKey: true },
      name: { type: DataTypes.STRING },
      safe_name: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING },
      priv: { type: DataTypes.INTEGER }
    }, {
      sequelize: this._db,
      modelName: 'UserStat',
      createdAt: false,
      updatedAt: false,
      tableName: this._options.table.stat || 'users'
    })
    // SQLUserHoldingNames.belongsTo(SQLUserInfo)
    // SQLUserInfo.hasMany(SQLUserHoldingNames, { as: 'old_names' })
    await this._db.authenticate()
      .then(() => console.log('Connection has been established successfully.'))
      .catch(err => console.error('Unable to connect to the source:', err))
  }

  async stop () {
    return this._db?.close()
  }
}

export default function MysqlSourcePlugin (ctx: USBC, options: PluginOptions) {
  ctx.useDatabase(new SQLSource(ctx, options))
}
