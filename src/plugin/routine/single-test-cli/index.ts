import { USBC } from 'app'
import { CheckResult, UserHoldingNames } from 'types/source'
import prompts from 'prompts'
import chalk from 'chalk'

// @ts-expect-error no declaration
import * as eaw from 'eastasianwidth'

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
        approve () { },
        reject (reason) {
          fakeUser.rejected = true
          this.checkResult.push(reason)
        }
      }

      await ctx.check(fakeUser)
      await ctx.justify(fakeUser)
      // console.log()
      if (!fakeUser.rejected) {
        console.log(
          chalk.green('looks good!')
        )
      } else {
        console.log(
          [
            chalk.yellow('rejected.'), '\n',
            chalk.bold('marked rejection(s):'), '\n',
            fakeUser.checkResult.map((result) => {
              return createMessage(fakeUser, result)
            }).join('\n')
          ].join(''))
      }
    }
  })
}
function handleFullWidth (chars: string) {
  return ' '.repeat(eaw.length(chars))
}

const start = '┌ '
const indent = '├── '
const end = '└── '

function createMessage (fakeUser: UserHoldingNames, { index, length, message, markedBy }: CheckResult) {
  const name = fakeUser.name

  let before = name.slice(0, index)
  const positivePart = name.slice(index, index + length)
  let after = name.slice(index + length)

  if (before.length >= 8) {
    before = '...' + before.slice(-8)
  }
  if (after.length >= 8) {
    after = after.slice(-8) + '...'
  }

  return [
    start + chalk.underline(markedBy.name + ':'),
    indent + chalk.dim(before) + chalk.black.bgYellowBright(positivePart) + chalk.dim(after),
    end + handleFullWidth(before) + '^ ' + message
  ].join('\n')
}
