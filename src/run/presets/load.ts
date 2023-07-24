import { App } from 'app'
import config from 'plugin/config'

import LocalWhitelist from 'plugin/checker/whitelist/local'

import words from 'naughty-words'
import LocalChecker from 'plugin/checker/forbidden-words/strategy/local'
import RemoteChecker from 'plugin/checker/forbidden-words/strategy/remote'
import Deduplicate from 'plugin/checker/deduplicate'

export default async function createApp () {
  const app = new App()

  await Promise.all([
    app.use(config, {
      version: 2,
      check: {
        version: {
          $lte: 2
        }
      }
    }),

    app.use(LocalChecker, {
      file: 'assets/forbidden.txt'
    }),

    app.use(RemoteChecker, {
      fetch: {
        url: 'https://raw.githubusercontent.com/ppy-sb/sensitive-words/master/色情类.txt',
        method: 'get'
      },
      separator: ',\n'
    }),

    app.use(LocalChecker, {
      forbidden: words.zh.concat([]),
      tag: 'npm::naughty-words::zh'
    }),

    app.use(LocalChecker, {
      forbidden: words.en.concat([]),
      tag: 'npm::naughty-words::en'
    }),

    app.use(RemoteChecker, {
      fetch: {
        url: 'https://raw.githubusercontent.com/cjh0613/tencent-sensitive-words/main/sensitive_words_lines.txt',
        method: 'get'
      },
      ignoreCase: false
    }),

    app.use(LocalWhitelist, { file: 'assets/whitelisted.txt' }),

    app.use(Deduplicate)
  ])

  return app
}
