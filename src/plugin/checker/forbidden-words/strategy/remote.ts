import { USBC } from 'app'
import axios, { AxiosRequestConfig } from 'axios'
import base, { Options as PluginOptions } from 'checker/forbidden-words/base'
const getWords = (opt: AxiosRequestConfig):Promise<string> =>
  axios({
    ...opt,
    responseType: 'text',
    transformResponse: [data => data]
  }).then(response => response.data)

export default async function localChecker (ctx: USBC, options: Partial<PluginOptions> & { fetch: AxiosRequestConfig }) {
  if (!options.forbidden) options.forbidden = []
  if (options.fetch) {
    if (options.fetch.url) options.fetch.url = encodeURI(options.fetch.url)
    const words = await getWords(options.fetch).then(words => words.split(options.splitter || '\n')).then(words => words.filter(a => a))
    options.forbidden.push(...words)
  }
  return base(ctx, options as PluginOptions)
}
