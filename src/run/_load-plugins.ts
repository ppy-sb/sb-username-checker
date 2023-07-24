import { App } from 'app'
import v1Checker from 'checker/forbidden-words'
import config from 'plugin/config'
import updateVersion from 'plugin/update-checker-version'
import rename from 'plugin/rename'
import BanRejectedUserPlugin from 'plugin/ban'
import LocalWhitelist from 'plugin/checker/whitelist/local'

import words from 'naughty-words'

export default async function createApp () {
  const app = new App()

  await app.use(config, {
    version: 2,
    check: {
      version: {
        $lte: 2
      }
    }
  })
  await app.use(v1Checker, {
    strategy: 'local',
    strategyOptions: {
      file: 'assets/forbidden.txt'
    }
  })
  await app.use(v1Checker, {
    strategy: 'remote',
    strategyOptions: {
      fetch: {
        url: 'https://raw.githubusercontent.com/ppy-sb/sensitive-words/master/色情类.txt',
        method: 'get'
      },
      separator: ',\n'
    }
  })
  await app.use(v1Checker, {
    strategy: 'local',
    strategyOptions: {
      forbidden: words.zh.concat([]),
      tag: 'nopm::naughty-words::zh'
    }
  })
  await app.use(v1Checker, {
    strategy: 'local',
    strategyOptions: {
      forbidden: words.en.concat([]),
      tag: 'npm::naughty-words::en'
    }
  })
  await app.use(v1Checker, {
    strategy: 'remote',
    strategyOptions: {
      fetch: {
        url: 'https://raw.githubusercontent.com/cjh0613/tencent-sensitive-words/main/sensitive_words_lines.txt',
        method: 'get'
      },
      ignoreCase: false
    }
  })
  await app.use(LocalWhitelist, { file: 'assets/whitelisted.txt' })
  await app.use(BanRejectedUserPlugin)
  await app.use(rename, {
    replaceWith: '*',
    when: {
      banned: false
    }
  })
  await app.use(updateVersion)

  return app
}
