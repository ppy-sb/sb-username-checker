import createApp from './_load-plugins'
import Api from 'plugin/routine/single-test-api'

(async () => {
  const app = await createApp()
  app.use(Api)

  await app.start()
  await app.run()
})()
