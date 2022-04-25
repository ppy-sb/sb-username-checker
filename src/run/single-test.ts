import createApp from './_load-plugins'
import CliSingleTest from 'plugin/routine/cli-single-test'

(async () => {
  const app = await createApp()
  app.use(CliSingleTest)

  await app.start()
  await app.run()
})()
