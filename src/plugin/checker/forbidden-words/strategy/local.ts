import { USBC } from 'app'
import { promises as fs } from 'fs'
import base, { Options as PluginOptions } from 'checker/forbidden-words/base'
const getWords = (path: string) =>
  fs.readFile(path, {
    encoding: 'utf8'
  })

export default async function localChecker (ctx: USBC, options: Partial<PluginOptions> & { file?: string }) {
  if (!options.forbidden) options.forbidden = []
  if (options.file) {
    const words = await getWords(options.file).then(words => words.split(options.splitter || '\n'))
    if (options.file) options.forbidden.push(...words)
  }
  return base(ctx, options as PluginOptions)
}
