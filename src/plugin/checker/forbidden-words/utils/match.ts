export function getAllIndexes (test: string, val: string, ignoreCase = true, spaced = false): number[] {
  const indexes: number[] = []

  if (ignoreCase) {
    test = test.toLowerCase()
    val = val.toLowerCase()
  }

  if (spaced) {
    if (test === val) return [0]
    return getAllIndexes(test, val + ' ', ignoreCase)
      .concat(
        getAllIndexes(test, ' ' + val, ignoreCase).map(index => index + 1)
      )
  }

  let i = -1
  while ((i = test.indexOf(val, i + 1)) !== -1) {
    indexes.push(i)
  }
  return indexes
}
