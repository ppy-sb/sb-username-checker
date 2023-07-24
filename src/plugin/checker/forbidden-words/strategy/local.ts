import { USBC } from 'app'
import { promises as fs } from 'fs'
import base from 'plugin/checker/forbidden-words'
import { Options as PluginOptions } from '../type'
const getWords = (path: string) =>
  fs.readFile(path, {
    encoding: 'utf8'
  })

export default async function LocalChecker (ctx: USBC, options: Partial<PluginOptions> & { file?: string }) {
  if (!options.forbidden) options.forbidden = []
  if (options.file) {
    const words = await (await getWords(options.file).then(words => words.split(options.separator || '\n'))).filter(Boolean)
    if (options.file) options.forbidden = options.forbidden.concat(words)
  }
  if (options.whitelisted) {
    options.forbidden = options.forbidden.filter(kw => options.whitelisted?.includes(kw) === false)
  }
  const name = options.file ? options.file : options.tag
  return base(ctx, { ...options, tag: `${LocalChecker.name}<${name}>` } as PluginOptions)
}
