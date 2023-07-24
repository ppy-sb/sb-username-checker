import createApp from './presets/load'
import CliSingleTest from 'plugin/routine/single-test-cli'

(async () => {
  const app = await createApp().then(app => app.clone())
  app.use(CliSingleTest)

  await app.start()
  await app.run()
})()
