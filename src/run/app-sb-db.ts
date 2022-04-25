import createApp from './_load-plugins'
import SQLSource from 'source/sql'
import batchChecker from 'plugin/routine/database-batch-check'

(async () => {
  const app = await createApp()

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
