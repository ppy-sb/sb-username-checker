import { App } from 'app'
import v1Checker from 'checker/forbidden-words'
// import LogModifiy from 'plugin/routine/batch-check/log'
import config from 'plugin/config'
import updateVersion from 'plugin/update-checker-version'
import rename from 'plugin/rename'
import BanRejectedUserPlugin from 'plugin/ban'

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
      file: 'assets/forbiddenwords.txt'
    }
  })
  await app.use(v1Checker, {
    strategy: 'remote',
    strategyOptions: {
      fetch: {
        url: 'https://raw.githubusercontent.com/ppy-sb/sensitive-words/master/%E8%89%B2%E6%83%85%E7%B1%BB.txt',
        method: 'get'
      },
      splitter: ',\n'
    }
  })
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
