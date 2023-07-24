import { USBC } from 'app'
import { promises as fs } from 'fs'
import base, { Options as PluginOptions } from 'checker/forbidden-words/base'
const getWords = (path: string) =>
  fs.readFile(path, {
    encoding: 'utf8'
  })

export default async function LocalChecker (ctx: USBC, options: Partial<PluginOptions> & { file?: string }) {
  if (!options.forbidden) options.forbidden = []
  if (options.file) {
    const words = await getWords(options.file).then(words => words.split(options.separator || '\n'))
    if (options.file) options.forbidden = options.forbidden.concat(words)
  }
  if (options.whitelisted) {
    options.forbidden = options.forbidden.filter(kw => options.whitelisted?.includes(kw) === false)
  }
  return base(ctx, { ...options, name: `${LocalChecker.name}<${options.file}>` } as PluginOptions)
}
