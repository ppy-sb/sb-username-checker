import { App } from 'app'
import TestSource from 'source/test'
import v1Checker from 'checker/forbidden-words'
import rename from 'plugin/rename'

const app = new App()
app.use(TestSource)
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
