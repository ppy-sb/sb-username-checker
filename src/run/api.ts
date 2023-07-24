import createApp from './presets/load'
import Api from 'plugin/routine/single-test-api'

(async () => {
  const app = await createApp().then(app => app.clone())
  app.use(Api, {
    host: '::'
  })

  await app.start()
  await app.run()
})()
