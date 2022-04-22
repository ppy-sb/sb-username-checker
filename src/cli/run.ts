import { App } from 'app'
import TestDatabase from 'database/test'
import v1Checker from 'checker/forbidden-words'
import rename from 'plugin/rename'

const app = new App()
app.use(TestDatabase)
app.use(rename, {
  replaceWith: '~~'
})
app.use(v1Checker, {
  strategy: 'local',
  strategyOptions: {
    file: 'assets/forbiddenwords.txt'
  }
})

app.run()
