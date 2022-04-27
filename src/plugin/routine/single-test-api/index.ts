import { USBC } from 'app'
import { UserHoldingNames } from 'types/source'
import fastify, { FastifyServerOptions } from 'fastify'
export interface APIOptions {
  fastify: FastifyServerOptions,
  port?: number,
  prefix?: string
}
export default function cliSingleTestPlugin (ctx: USBC, options: APIOptions = { fastify: {}, prefix: '/test' }) {
  const server = fastify(options.fastify)
  server.listen(options.port || 4532)
  ctx.useApplication(function TestAPI (ctx: USBC) {
    server.get(options.prefix + '/:name', async (req, rep) => {
      const name = (req.params as any).name
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
    })
  })
  // ctx.useApplication(async function LoopTest () {
  //   while (true) {
  //     const { name }: { name: string } = await prompts({
  //       type: 'text',
  //       name: 'name',
  //       message: 'try name:'
  //     })

  //     await ctx.check(fakeUser)
  //     // console.log()
  //     if (!fakeUser.rejected) {
  //       console.log(
  //         chalk.black.bgCyan(name),
  //         ': ',
  //         chalk.green('looks good!')
  //       )
  //     } else {
  //       console.log(
  //         [chalk.black.bgRedBright(name), ': ',
  //           chalk.yellow('rejected.'), '\n',
  //           chalk.bold('reason:'), '\n',
  //           chalk.gray(fakeUser.rejectReason.join(', \n')), '\n',
  //           chalk.bold('marked rejection(s):'), '\n',
  //           fakeUser.checkResult.name.map(({ index, length, positive }) => {
  //             const before = name.slice(0, index)
  //             const positivePart = name.slice(index, index + length)
  //             const after = name.slice(index + length)
  //             return [
  //               before + chalk.bgCyanBright.black(positivePart) + after
  //               // ' '.repeat(index) + '^' + '~'.repeat(length)
  //             ].join('\n')
  //           }).join('\n')
  //         ].join(''))
  //     }
  //   }
  // })
}
