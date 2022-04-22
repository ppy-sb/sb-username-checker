import { USBC } from 'app'
import { User } from 'types/database'

export type Plugin<Options = any>
  = (app: USBC, options: Options) => void;

export type Config<T extends Plugin>
  = T extends Plugin<infer PluginOptions> ? PluginOptions : never

export type Checker
  = (user: User) => void
