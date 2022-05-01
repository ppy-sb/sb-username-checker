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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      approve () {},
      reject (reason) {
        fakeUser.rejected = true
        this.checkResult.push(reason)
      }
    }
    await ctx.check(fakeUser)
    return {
      ...fakeUser,
      isDatabase: undefined
    }
  }

  ctx.useApplication(function TestAPI (ctx: USBC) {
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
