import { USBC } from 'app'
import axios, { AxiosRequestConfig } from 'axios'
import base, { Options as PluginOptions } from 'checker/forbidden-words/base'

const getWords = (opt: AxiosRequestConfig): Promise<string> =>
  axios({
    ...opt,
    responseType: 'text',
    transformResponse: [data => data]
  }).then(response => response.data)

export default async function RemoteChecker (ctx: USBC, options: Partial<PluginOptions> & { fetch: AxiosRequestConfig }) {
  if (!options.forbidden) options.forbidden = []
  if (options.fetch) {
    if (options.fetch.url) options.fetch.url = encodeURI(options.fetch.url)
    const words = await getWords(options.fetch).then(words => words.split(options.separator || '\n')).then(words => words.filter(a => a))
    options.forbidden = options.forbidden.concat(words)
  }
  if (options.whitelisted) {
    options.forbidden = options.forbidden.filter(kw => options.whitelisted?.includes(kw) === false)
  }
  return base(ctx, { ...options, name: `${RemoteChecker.name}<${options.fetch.url}>` } as PluginOptions)
}
