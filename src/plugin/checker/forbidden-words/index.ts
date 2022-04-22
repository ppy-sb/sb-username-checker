import { USBC } from 'app'
import localChecker from './strategy/local'
import remoteChecker from './strategy/remote'
export type GetOption<Options = any>
  = (app: USBC, options: Options) => void;

export type Config<T extends GetOption>
  = T extends GetOption<infer PluginOptions> ? PluginOptions : never

export default function createChecker<T extends GetOption> (ctx: USBC, options: Config<T>) {
  switch (options.strategy) {
    case 'local': {
      return localChecker(ctx, options.strategyOptions)
    }
    case 'remote': {
      return remoteChecker(ctx, options.strategyOptions)
    }
    default: {
      throw new Error('unknown strategy')
    }
  }
}
