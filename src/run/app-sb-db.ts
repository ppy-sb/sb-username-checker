import createDBApp from './presets/with-db'
import SQLSource from 'source/sql'
import batchChecker from 'plugin/routine/batch-check-database'

(async () => {
  const app = await createDBApp().then(app => app.clone())

  await app.use(SQLSource, {
    sequelize: process.env.SQL_URI || 'sqlite::memory:',
    table: {
      history: 'name_legality',
      stat: 'users'
    }
  })
  await app.use(batchChecker)

  await app.start()
  await app.run()
})()
