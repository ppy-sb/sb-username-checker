import { USBC } from 'app'
import LocalChecker from './strategy/local'
import RemoteChecker from './strategy/remote'
import { Config } from 'types/useable'

export type TOpt =
  | {
    strategy: 'local',
    strategyOptions: Config<typeof LocalChecker>
  }
  | {
    strategy: 'remote',
    strategyOptions: Config<typeof RemoteChecker>
  }
export default function createChecker<T extends TOpt> (ctx: USBC, options: T) {
  switch (options.strategy) {
    case 'local': {
      return LocalChecker(ctx, options.strategyOptions)
    }
    case 'remote': {
      return RemoteChecker(ctx, options.strategyOptions)
    }
    default: {
      throw new Error('unknown strategy')
    }
  }
}
