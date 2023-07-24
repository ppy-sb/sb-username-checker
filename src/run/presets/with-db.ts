import createApp from './load'
import updateVersion from 'plugin/update-checker-version'
import rename from 'plugin/rename'
import BanRejectedUserPlugin from 'plugin/ban'
export default function createDBApp () {
  return createApp().then(async app => {
    await Promise.all([
      app.use(BanRejectedUserPlugin),

      app.use(rename, {
        replaceWith: '*',
        when: {
          banned: false
        }
      }),

      app.use(updateVersion)
    ])

    return app
  })
}
