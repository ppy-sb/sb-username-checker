import { USBC } from 'app'
import { UserHoldingNames } from 'types/source'
import fastify, { FastifyServerOptions } from 'fastify'
export interface APIOptions {
  fastify?: FastifyServerOptions,
  port?: number,
  host?: string,
  prefix?: string
}
export default function cliSingleTestPlugin (ctx: USBC, options: APIOptions = {}) {
  ctx.useApplication(async function TestAPI () {
    const server = fastify(options.fastify)
    server.get<{
      Querystring: {
        name: string
      },
      Params: {
        name: string
      },
    }>(options.prefix || '/test', handler)

    server.get<{
      Querystring: {
        name: string
      },
      Params: {
        name: string
      },
    }>(options.prefix || '/test' + '/:name', handler)

    console.log('server started at ' + await server.listen(options.port || 4532, options.host))
  })

  async function handler (req: { query: { name: string }; params: { name: string } }) {
    const name = req.query.name || req.params.name
    const fakeUser: UserHoldingNames = {
      isDatabase: false,
      name,
      rejected: false,
      checkResult: [],
      approve () { },
      reject (reason) {
        fakeUser.rejected = true
        this.checkResult.push(reason)
      }
    }
    await ctx.check(fakeUser)
    await ctx.justify(fakeUser)
    return {
      ...fakeUser,
      checkResult: fakeUser.checkResult,
      isDatabase: undefined
    }
  }
}
