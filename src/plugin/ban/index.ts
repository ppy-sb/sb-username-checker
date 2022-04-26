import { USBC } from 'app'
// import Confirm from 'prompt-confirm'

export default function BanRejectedUserPlugin (app: USBC) {
  app.useModifier(async function BanRejectedUser (user) {
    if (!user.rejected) return
    if (!user.isDatabase) return
    const userInfo = await user.getStat()
    if (!userInfo) { throw new Error('user not found') }
    userInfo.banned = true
  })
}
