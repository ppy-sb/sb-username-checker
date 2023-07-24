import { USBC } from 'app'
import { UserHoldingNames, DatabaseUserHoldingNames } from 'types/source'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Plugin<Options = any>
  = (app: USBC, options: Options) => void;

export type Config<T extends Plugin>
  = T extends Plugin<infer PluginOptions> ? PluginOptions : never

export type Callback
  = (user: UserHoldingNames | DatabaseUserHoldingNames) => void

export type AppCallback
  = (ctx: USBC) => void
