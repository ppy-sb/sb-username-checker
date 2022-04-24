import { USBC } from 'app'
import { UserHoldingNames, DatabaseUserHoldingNames } from 'types/source'

export type Plugin<Options = any>
  = (app: USBC, options: Options) => any;

export type Config<T extends Plugin>
  = T extends Plugin<infer PluginOptions> ? PluginOptions : never

export type Callback
  = (user: UserHoldingNames | DatabaseUserHoldingNames) => void

export type AppCallback
  = (ctx: USBC) => void
