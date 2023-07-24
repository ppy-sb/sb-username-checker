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
  const server = fastify(options.fastify)

  const handler = async (req: { query: { name: string }; params: { name: string } }) => {
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
    return {
      ...fakeUser,
      checkResult: fakeUser.checkResult.map(res => ({ ...res, markedBy: { name: res.markedBy.name } })),
      isDatabase: undefined
    }
  }

  ctx.useApplication(function TestAPI () {
    server.listen(options.port || 4532, options.host)
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
  })
}
