import { USBC } from 'app'
export interface Options {
  replaceWith: string
}
export default function RenameUserPlugin (ctx: USBC, options: Options) {
  if (!options.replaceWith) options.replaceWith = '*'
  ctx.useModifier((user) => {
    user._checkResult.name?.forEach(word => {
      user.name = user.name.split(word).join(options.replaceWith.repeat(word.length || 1))
    })
    user._checkResult.nameSafe?.forEach(word => {
      user.name_safe = user.name_safe.split(word).join(options.replaceWith.repeat(word.length || 1))
    })
  })
}
