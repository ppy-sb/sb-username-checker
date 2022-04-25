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
        _rejected: false,
        _rejectReason: [],
        _checkResult: {
          name: []
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        approve () {},
        reject (reason) {
          fakeUser._rejected = true
          this._rejectReason.push(reason)
        }
      }

      await ctx.check(fakeUser)
      // console.log()
      if (!fakeUser._rejected) {
        console.log(
          chalk.black.bgCyan(name),
          ': ',
          chalk.green('looks good!')
        )
      } else {
        console.log(
          [chalk.black.bgRedBright(name), ': ',
            chalk.yellow('rejected.'), '\n',
            chalk.bold('reason:'), '\n',
            chalk.gray(fakeUser._rejectReason.join(', \n')), '\n',
            chalk.bold('marked rejection(s):'), '\n',
            fakeUser._checkResult.name.map(({ index, length, positive }) => {
              const before = name.slice(0, index)
              const positivePart = name.slice(index, index + length)
              const after = name.slice(index + length)
              return [
                before + chalk.bgCyanBright.black(positivePart) + after,
                // ' '.repeat(index) + '^' + '~'.repeat(length)
              ].join('\n')
            }).join('\n')
          ].join(''))
      }
    }
  })
}
