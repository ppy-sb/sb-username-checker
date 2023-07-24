import { USBC } from 'app'
import { promises as fs } from 'fs'
import base from '.'
const getWords = (path: string) =>
  fs.readFile(path, {
    encoding: 'utf8'
  })

export default async function LocalWhitelist (ctx: USBC, options: {file: string, separator?: string}) {
  const words = await getWords(options.file).then(words => words.split(options.separator || '\n'))
  return base(ctx, words)
}
