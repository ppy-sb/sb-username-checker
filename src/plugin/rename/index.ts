import { USBC } from 'app'
export interface Options {
  replaceWith: string,
  when: Partial<{
    banned: boolean
    oldVersion: boolean
    sameVersion: boolean
    lastScanNewerThan: Date
  }>
}
export default function RenameUserPlugin (ctx: USBC, options: Options) {
  if (!options.replaceWith) options.replaceWith = '*'
  ctx.useModifier(async (user) => {
    if (user.isDatabase === true) {
      const userStat = await user.getStat()
      if (!options.when.banned && userStat?.banned) return
    }
    if (options.when.oldVersion && user.inappropriate_checker_version >= ctx._version) return
    if (options.when.sameVersion && user.inappropriate_checker_version !== ctx._version) return
    if (options.when.lastScanNewerThan && user.inappropriate_check_date <= options.when.lastScanNewerThan) return
    user._checkResult.name?.forEach(word => {
      user.name = user.name.split(word).join(options.replaceWith.repeat(word.length || 1))
    })
    user._checkResult.nameSafe?.forEach(word => {
      user.name_safe = user.name_safe.split(word).join(options.replaceWith.repeat(word.length || 1))
    })
  })
}
