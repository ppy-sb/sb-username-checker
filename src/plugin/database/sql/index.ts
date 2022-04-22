import { USBC } from 'app'
import { User, Database } from 'types/database'
import { Sequelize, Model, CreationOptional, DataTypes, Options, Op, WhereOptions } from 'sequelize'
import { SearchParams } from 'app/Config'

export interface PluginOptions {
  sequelize: Options,
  table: string
}
class SQLUserInfo extends Model {
  declare name: string
  declare safe_name: string
}
// order of InferAttributes & InferCreationAttributes is important.
class SQLUser extends Model<Omit<User, 'reject' | 'approve' | 'inappropriate_check_date'>> implements User {
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
}

class SQLDatabase implements Database {
  _db?: Sequelize = undefined
  _options?: PluginOptions
  _virtual: Map<unknown, User>
  _usbc: USBC

  constructor (ctx: USBC, options: {
    sequelize: Options
    table: string
  }) {
    this._usbc = ctx
    this._db = new Sequelize(options.sequelize)
    this._virtual = new Map()
  }

  _modifySearchParams (find: SearchParams): WhereOptions {
    const f:Record<string, Record<string, unknown>> = JSON.parse(JSON.stringify(find))
    Object.entries(f).forEach(([key, ops]) => {
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

  fetchUsers (find: SearchParams) {
    const where = this._modifySearchParams(find)
    return SQLUser.findAll({
      where
    }).then(users => users.map(user => {
      user.inappropriate_checker_version = this._usbc._version
      return user
    })) as unknown as Promise<User[]>
  }

  approve (users: SQLUser[]) {
    return Promise.all(users.map(user => user.save()))
  }

  reject (users: SQLUser[]) {
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

  #getVirtualUser (_id: unknown): Partial<User> {
    // @ts-expect-error partial not working
    if (!this._virtual.has(_id)) this._virtual.set(_id, {})
    return this._virtual.get(_id) as Partial<User>
  }

  async start () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const vm = this
    if (!this._db) return
    SQLUser.init({
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
          const user = vm.#getVirtualUser(_id)
          if (!user._rejectReason) user._rejectReason = []
          // user.reject_reason = user._rejectReason.join('\n')
          this.setDataValue('reject_reason', user._rejectReason.join('\n'))
          return user._rejectReason
        },
        set (value: string[]) {
          const _id = this.getDataValue('_id')
          const user = vm.#getVirtualUser(_id)
          user._rejectReason = value
          this.setDataValue('reject_reason', value.join('\n'))
        }
      },
      _checkResult: {
        type: DataTypes.VIRTUAL,
        get () {
          const _id = this.getDataValue('_id')
          const user = vm.#getVirtualUser(_id)
          if (!user._checkResult) {
            user._checkResult = {
              name: [],
              nameSafe: []
            }
          }
          return user._checkResult
        },
        set (value: any) {
          const _id = this.getDataValue('_id')
          const user = vm.#getVirtualUser(_id)
          user._checkResult = value
        }
      },
      _rejected: {
        type: DataTypes.VIRTUAL,
        get () {
          const _id = this.getDataValue('_id')
          const user = vm.#getVirtualUser(_id)
          return user._rejected
        },
        set (value: boolean) {
          const _id = this.getDataValue('_id')
          const user = vm.#getVirtualUser(_id)
          user._rejected = value
        }
      }
    }, {
      sequelize: this._db,
      modelName: 'User',
      tableName: 'name_legality',
      createdAt: false,
      updatedAt: 'inappropriate_check_date'
    })
    SQLUserInfo.init({
      name: { type: DataTypes.STRING },
      safe_name: { type: DataTypes.STRING }
    }, {
      sequelize: this._db,
      modelName: 'UserInfo',
      createdAt: false,
      updatedAt: false,
      tableName: 'users'
    })
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
