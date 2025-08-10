import createApp from './load'
import updateVersion from 'plugin/update-checker-version'
import rename from 'plugin/rename'
import BanRejectedUserPlugin from 'plugin/ban'
import config from 'plugin/config'
export default function createDBApp () {
  return createApp().then(async app => {
    await Promise.all([
      app.use(config, {
        version: 0,
        check: {
        }
      }),

      app.use(BanRejectedUserPlugin),

      app.use(rename, {
        replaceWith: '~',
        when: {
          banned: true
        },
        safeName: 'generate'
      }),

      app.use(updateVersion)
    ])

    return app
  })
}
