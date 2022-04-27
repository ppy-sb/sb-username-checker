import { USBC } from 'app'
import { UserHoldingNames } from 'types/source'
import prompts from 'prompts'
import chalk from 'chalk'

export default function cliSingleTestPlugin (ctx: USBC) {
  ctx.useApplication(async function LoopTest () {
    while (true) {
      const { name }: { name: string } = await prompts({
        type: 'text',
        name: 'name',
        message: 'try name:'
      })

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
      // console.log()
      if (!fakeUser.rejected) {
        console.log(
          chalk.black.bgCyan(name),
          ': ',
          chalk.green('looks good!')
        )
      } else {
        console.log(
          [chalk.black.bgRedBright(name), ': ',
            chalk.yellow('rejected.'), '\n',
            chalk.bold('marked rejection(s):'), '\n',
            fakeUser.checkResult.map(({ field, index, length, message }) => {
              if (field === 'safeName') return null
              const name = fakeUser[field]
              const before = name.slice(0, index)
              const positivePart = name.slice(index, index + length)
              const after = name.slice(index + length)
              return [
                before + chalk.bgCyanBright.black(positivePart) + after,
                ' '.repeat(index) + '^ ' + message
              ].join('\n')
            }).join('\n')
          ].join(''))
      }
    }
  })
}
