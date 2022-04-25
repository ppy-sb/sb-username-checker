import path from 'path'
const baseDir = path.join(__dirname, '../run')

const file = process.argv[2]

// console.log(path.join(baseDir, file))

import(path.join(baseDir, file))
