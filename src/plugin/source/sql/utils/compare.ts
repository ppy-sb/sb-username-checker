/* eslint-disable no-unused-vars */
import { diff, Diff, DiffDeleted, DiffEdit, DiffNew } from 'deep-diff'
export type DiffType = {
  N: 'Create',
  D: 'Delete',
  E: 'Modify',
  A: 'ModifyArray'
}
export enum DiffTypeEnum {
  N = 'Create',
  D = 'Delete',
  E = 'Modify',
  A = 'ModifyArray'
}
export type CompareResult<T, U> = {
  field: any[],
  op: DiffType[Pick<Diff<T, U>, 'kind'>[keyof Pick<Diff<T, U>, 'kind'>]],
  // before: T,
  // after: U
  before?: T extends DiffDeleted<T> | DiffEdit<T, U> ? T : never
  after?: U extends DiffNew<U> | DiffEdit<T, U> ? U : never
}

export default function compare<T, U> (before: T, after: U) {
  const result = diff(before, after)
  if (!result) { return [] }
  const rtn: Array<CompareResult<T, U>> = result.map((result) => {
    const rtn: any = {
      op: DiffTypeEnum[result.kind],
      field: result.path || []
    }

    switch (result.kind) {
      case 'N':
        rtn.after = result.rhs
        return rtn
      case 'E':
        rtn.before = result.lhs
        rtn.after = result.rhs
        return rtn
      case 'D':
        rtn.before = result.lhs
        return rtn
      case 'A':
      default:
        return {
          ...result,
          ...rtn
        }
    }
  })
  return rtn
}
