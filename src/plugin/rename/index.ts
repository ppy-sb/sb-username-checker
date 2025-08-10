import { USBC } from 'app'
export interface Options {
  replaceWith: string,
  when: Partial<{
    banned: boolean
    oldVersion: boolean
    sameVersion: boolean
    lastScanNewerThan: Date
  }>
  safeName?: 'independent' | 'generate'
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
    checkName.checkResult.forEach((d) => {
      let name = d.field === 'name' ? checkName.name : checkName.safeName
      name = name.slice(0, d.index) + options.replaceWith.repeat(d.length) + name.slice(d.index + d.length)
      checkName[d.field] = name
    })

    if (options.safeName === 'generate') {
      checkName.safeName = makeSafeName(checkName.name)
    }
  })
}

function makeSafeName (name: string) {
  return name.toLowerCase().replaceAll(' ', '_')
}
