export function getAllIndexes (test: string, val: string, ignoreCase = true, spaced = false): number[] {
  const indexes: number[] = []

  if (ignoreCase) {
    test = test.toLowerCase()
    val = val.toLowerCase()
  }

  if (spaced) {
    if (test === val) return [0]
    let idx = 0
    // eslint-disable-next-line no-useless-escape
    const explode = test.split(/[- _\(\)\[\]]/).map(val => {
      const value = [val, idx] as const
      idx += val.length + 1
      return value
    })

    for (const [v, i] of explode) {
      if (v === val) {
        indexes.push(i)
      }
    }
    return indexes
  }

  let i = -1
  while ((i = test.indexOf(val, i + 1)) !== -1) {
    indexes.push(i)
  }
  return indexes
}
