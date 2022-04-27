import path from 'path'
const baseDir = path.join(__dirname, '../run')

const file = process.argv.slice(2)

// console.log(path.join(baseDir, file))

file.forEach(f => import(path.join(baseDir, f)))
