import { promises as fs } from 'fs'
import path from 'path'
function randomDate (start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}
const today = new Date(Date.now())
const start = new Date(Date.parse('2011-12-11'))
const createUser = (name: string, index: number) => {
  return {
    id: 1001 + index,
    name,
    name_safe: name,
    is_active: true,
    create_time: randomDate(start, today),
    inappropriate_check_date: new Date(),
    inappropriate_checker_version: 0,
    _rejected: false,
    _rejectReason: [],
    _checkResult: {
      name: [],
      nameSafe: []
    }
  }
}

const users =
  fs.readFile(path.join(__dirname, './usernames.txt'), {
    encoding: 'utf8'
  })
    .then(usernamestxt =>
      usernamestxt.split('\n').map(createUser)
    )

export default async () => await users
