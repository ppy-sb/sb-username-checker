import { App } from 'app'
import SQLSource from 'source/sql'
import v1Checker from 'checker/forbidden-words'
// import LogModifiy from 'plugin/routine/batch-check/log'
import config from 'plugin/config'
import updateVersion from 'plugin/update-checker-version'
import batchChecker from 'plugin/routine/batch-check'
import rename from 'plugin/rename'
import BanRejectedUserPlugin from 'plugin/ban'

const app = new App()
;(async () => {
  await app.use(config, {
    version: 2,
    check: {
      version: {
        $lte: 2
      }
    }
  })
  await app.use(SQLSource, {
    sequelize: process.env.SQL_URI || 'sqlite::memory:',
    table: {
      history: 'name_legality',
      stat: 'users'
    }
  })
  // await app.use(LogModifiy)
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
        url: 'https://raw.githubusercontent.com/jkiss/sensitive-words/master/色情类.txt',
        method: 'get'
      },
      splitter: ',\n'
    }
  })

  await app.use(batchChecker)
  await app.use(BanRejectedUserPlugin)
  await app.use(rename, {
    replaceWith: '*',
    when: {
      banned: false
    }
  })
  await app.use(updateVersion)

  await app.start()
  await app.run()
})()
