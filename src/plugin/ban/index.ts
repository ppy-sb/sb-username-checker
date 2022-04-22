import { USBC } from 'app'
import { User } from 'types/database'

export default function BanRejectedUserPlugin (app: USBC) {
  app.useModifier(async function BanRejectedUser (user: User) {
    const userInfo = await user.getUserInfo()
    if (!userInfo) { throw new Error('user not found') }
    userInfo.banned = true
  })
}
