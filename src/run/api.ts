import createApp from './_load-plugins'
import Api from 'plugin/routine/single-test-api'

(async () => {
  const app = await createApp().then(app => app.clone())
  app.use(Api)

  await app.start()
  await app.run()
})()
