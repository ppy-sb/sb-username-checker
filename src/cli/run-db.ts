import { App } from 'app'
import SQLDatabase from 'database/sql'
import v1Checker from 'checker/forbidden-words'
import LogModifiy from 'plugin/log'
import config from 'plugin/config'
import rename from 'plugin/rename'
const app = new App()
;(async () => {
  await app.use(config, {
    version: 2,
    check: {
      version: {
        $lt1: 2
      }
    }
  })
  await app.use(SQLDatabase, {
    // @ts-expect-error idk why I got error
    sequelize: process.env.SQL_URI
  })
  await app.use(rename, {
    replaceWith: '~'
  })
  await app.use(LogModifiy)
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

  await app.run()
})()
