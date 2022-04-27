/* eslint-disable no-unused-vars */
import { diff, Diff, DiffDeleted, DiffEdit, DiffNew } from 'deep-diff'
export type DiffType = {
  N: 'create',
  D: 'delete',
  E: 'modify',
  A: 'modify-array'
}
export enum DiffTypeEnum {
  N = 'create',
  D = 'delete',
  E = 'modify',
  A = 'modify-array'
}
export type CompareResult<T, U> = {
  field: string[],
  op: DiffType[Pick<Diff<T, U>, 'kind'>[keyof Pick<Diff<T, U>, 'kind'>]],
  before?: T extends DiffDeleted<T> | DiffEdit<T, U> ? T : never
  after?: U extends DiffNew<U> | DiffEdit<T, U> ? U : never
}

export default function compare<T, U> (before: T, after: U) {
  const result = diff(before, after)
  if (!result) { return [] }
  const rtn: Array<CompareResult<T, U>> = result.map((result) => {
    const rtn: CompareResult<T, U> = {
      op: DiffTypeEnum[result.kind],
      field: result.path || [],
      // @ts-expect-error before is optional
      before: result?.lhs,
      // @ts-expect-error after is optional
      after: result?.rhs
    }
    return rtn
  })
  return rtn
}
