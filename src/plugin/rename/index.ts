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
  ctx.useModifier(async (checkName) => {
    if (checkName.isDatabase !== true) return
    const userStat = await checkName.getStat()
    if (!options.when.banned && userStat?.banned) return
    if (options.when.oldVersion && checkName.checkerVersion >= ctx._version) return
    if (options.when.sameVersion && checkName.checkerVersion !== ctx._version) return
    if (options.when.lastScanNewerThan && checkName.checkDate <= options.when.lastScanNewerThan) return
    checkName.checkResult.forEach(({ positive }) => {
      checkName.name = checkName.name.split(positive).join(options.replaceWith.repeat(positive.length || 1))
    })
  })
}
