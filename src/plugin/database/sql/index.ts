import { USBC } from 'app'
import { User, Database } from 'types/database'
import { Sequelize, Model, CreationOptional, DataTypes, Options, Op, WhereOptions, FindOptions } from 'sequelize'
import { SearchParams } from 'plugin/config'
import UserInfoWrapper from './UserStat'

export interface PluginOptions {
  sequelize: Options,
  table: string
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
class SQLUserHoldingNames extends Model<Omit<User, 'reject' | 'approve' | 'inappropriate_check_date'>> implements User {
  declare _id: CreationOptional<number>
  declare id: number
  declare name: string
  declare name_safe: string
  declare is_active: boolean
  declare inappropriate_check_date: Date
  declare approve: () => void
  declare reject: (reason: string) => void
  declare inappropriate_checker_version: number
  declare create_time: number
  declare reject_reason: string
  declare _rejectReason: string[]
  declare _rejected: boolean
  declare _checkResult: {
    name: string[],
    nameSafe: string[],
  }

  declare getUserInfo:() => Promise<UserInfoWrapper | null>
}
class SQLDatabase implements Database {
  _db?: Sequelize = undefined
  _options?: PluginOptions
  _virtual: Map<unknown, User>
  _usbc: USBC
  _relational: Map<string, UserInfoWrapper>

  constructor (ctx: USBC, options: {
    sequelize: Options
    table: string
  }) {
    this._usbc = ctx
    this._db = new Sequelize(options.sequelize)
    this._virtual = new Map()
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

  fetchAllUserNameHistories (find: SearchParams) {
    const where = this._modifySearchParams(find)
    return SQLUserHoldingNames.findAll({
      where
    }).then(users => users.map(user => {
      user.inappropriate_checker_version = this._usbc._version
      return user
    })) as unknown as Promise<User[]>
  }

  async fetchUserStats (find: FindOptions & {id: number}): Promise<UserInfoWrapper | null> {
    const cache = this._relational.get(`stat-${find.id}`)
    if (cache) return cache
    const result = await SQLUserInfo.findOne(find)
    if (!result) return null
    const rtn = new UserInfoWrapper(result)
    this._relational.set(`stat-${find.id}`, rtn)
    return rtn
  }

  approve (users: SQLUserHoldingNames[]): Promise<unknown> {
    return Promise.all(users.map(user => user.save()))
  }

  reject (users: SQLUserHoldingNames[]) {
    return Promise.all(users.map(user => {
      if (user.is_active) {
        console.warn('writing back to users table:', { id: user.id, name: user.name, name_safe: user.name_safe })
        SQLUserInfo.update({
          name: user.name,
          safe_name: user.name_safe
        }, {
          where: {
            id: user.id
          }
        })
      }
      return user.save()
    }))
  }

  #getVirtualUserHistories (_id: unknown): Partial<User> {
    // @ts-expect-error partial not working
    if (!this._virtual.has(_id)) this._virtual.set(_id, {})
    return this._virtual.get(_id) as Partial<User>
  }

  async start () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const vm = this
    if (!this._db) return
    // @ts-expect-error put later
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
      reject_reason: { type: DataTypes.STRING },
      _rejectReason: {
        type: DataTypes.VIRTUAL,
        get () {
          const _id = this.getDataValue('_id')
          const user = vm.#getVirtualUserHistories(_id)
          if (!user._rejectReason) user._rejectReason = []
          // user.reject_reason = user._rejectReason.join('\n')
          this.setDataValue('reject_reason', user._rejectReason.join('\n'))
          return user._rejectReason
        },
        set (value: string[]) {
          const _id = this.getDataValue('_id')
          const user = vm.#getVirtualUserHistories(_id)
          user._rejectReason = value
          this.setDataValue('reject_reason', value.join('\n'))
        }
      },
      _checkResult: {
        type: DataTypes.VIRTUAL,
        get () {
          const _id = this.getDataValue('_id')
          const user = vm.#getVirtualUserHistories(_id)
          if (!user._checkResult) {
            user._checkResult = {
              name: [],
              nameSafe: []
            }
          }
          return user._checkResult
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set (value: any) {
          const _id = this.getDataValue('_id')
          const user = vm.#getVirtualUserHistories(_id)
          user._checkResult = value
        }
      },
      _rejected: {
        type: DataTypes.VIRTUAL,
        get () {
          const _id = this.getDataValue('_id')
          const user = vm.#getVirtualUserHistories(_id)
          return user._rejected
        },
        set (value: boolean) {
          const _id = this.getDataValue('_id')
          const user = vm.#getVirtualUserHistories(_id)
          user._rejected = value
        }
      }
    }, {
      sequelize: this._db,
      modelName: 'UsingNames',
      tableName: 'name_legality',
      createdAt: false,
      updatedAt: 'inappropriate_check_date'
    })
    SQLUserHoldingNames.prototype.getUserInfo = function () {
      const id = this._id
      return vm.fetchUserStats({ id })
    }
    SQLUserInfo.init({
      name: { type: DataTypes.STRING },
      safe_name: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING },
      priv: { type: DataTypes.INTEGER }
      // banned: {
      //   type: DataTypes.VIRTUAL,
      //   get () {
      //     const priv = this.getDataValue('priv')
      //     return priv & 1 << 0
      //   },
      //   set (value: boolean) {
      //     const priv = this.getDataValue('priv')
      //     if (value) {
      //       this.setDataValue('priv', priv & 1 << 0)
      //     } else {
      //       this.setDataValue('priv', priv & (~1 << 0))
      //     }
      //   }
      // }
    }, {
      sequelize: this._db,
      modelName: 'UserInfo',
      createdAt: false,
      updatedAt: false,
      tableName: 'users'
    })
    // SQLUserHoldingNames.belongsTo(SQLUserInfo)
    // SQLUserInfo.hasMany(SQLUserHoldingNames, { as: 'old_names' })
    await this._db.authenticate()
      .then(() => console.log('Connection has been established successfully.'))
      .catch(err => console.error('Unable to connect to the database:', err))
  }

  async stop () {
    return this._db?.close()
  }
}

export default function MysqlDatabasePlugin (ctx: USBC, options: PluginOptions) {
  ctx.useDatabase(new SQLDatabase(ctx, options))
}
