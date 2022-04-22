import { Plugin } from 'types/useable'
import { NotEmpty } from 'types/utils'
export type cmp = '$gt' | '$gte' | '$eq' | '$lt' | '$lte' | '$ne'
export type SearchParams = Partial<{
  // version: OneKey<cmp, number>
  // date: OneKey<cmp, Date>
  version: NotEmpty<Record<cmp, number>>,
  date: NotEmpty<Record<cmp, Date>>
}>
export interface AppOptions {
  version: number,
  check?: SearchParams
}
const a:Plugin = function Config (app, options: AppOptions) {
  if (!options.check) {
    options.check = {
      version: {
        $gte: options.version
      }
    }
  }
}
export default a
