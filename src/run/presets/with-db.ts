import createApp from './load'
import updateVersion from 'plugin/update-checker-version'
import rename from 'plugin/rename'
import BanRejectedUserPlugin from 'plugin/ban'
import config from 'plugin/config'
export default function createDBApp () {
  return createApp().then(async app => {
    await Promise.all([
      app.use(config, {
        version: 2,
        check: {
          version: {
            $lte: 2
          }
        }
      }),

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
