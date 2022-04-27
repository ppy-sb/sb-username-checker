import { SearchParams } from 'plugin/config'
// import { CompareResult } from 'plugin/source/sql/utils/compare'
export type DiffType = {
  N: 'create',
  D: 'delete',
  E: 'modify',
  A: 'modify-array'
}
// export enum DiffTypeEnum {
//   N = 'create',
//   D = 'delete',
//   E = 'modify',
//   A = 'modify-array'
// }
export type CompareResult<T> = {
  field: string[],
  op: DiffType[keyof DiffType],
  before?: T,
  after?: T
  // before?: T extends DiffDeleted<T> | DiffEdit<T, U> ? T : never
  // after?: U extends DiffNew<U> | DiffEdit<T, U> ? U : never
}
export interface UserStat {
  id: number,
  name: string,
  safeName: string,
  email: string,
  banned: boolean
}
export interface CheckResult {
  field: 'name' | 'safeName'
  index: number,
  length: number,
  positive: string,
  message: string
}
export interface UserHoldingNames {
  isDatabase: false
  name: string,
  rejected: boolean
  // rejectReason: string[],
  checkResult: CheckResult[]
  // checkResult: {
  //   name: CheckResult[]
  //   nameSafe?: CheckResult[]
  // }
  approve(): void,
  reject(reason: CheckResult): void
}
export interface DatabaseAddon<T> {
  isDatabase: true
  save(): Promise<T>
  changes(): CompareResult<keyof Omit<T, 'save' | 'approve' | 'reject' | 'rejected' | 'checkResult' | 'isDatabase'>>[]
}
export interface DatabaseUserStat extends DatabaseAddon<DatabaseUserStat>, Omit<UserStat, 'isDatabase'> {}
export interface DatabaseUserHoldingNames extends DatabaseAddon<DatabaseUserHoldingNames>, Omit<UserHoldingNames, 'isDatabase'> {
  _id: number,
  id: number,
  getStat(): Promise<DatabaseUserStat | null>
  safeName: string,
  active: boolean,
  createTime: number,
  checkDate: Date,
  checkerVersion: number,
  rejectReason: string,
}

export interface Source {
  isDatabase: false
  start(): void
  stop(): void
}
export interface Database extends Omit<Source, 'isDatabase'> {
  isDatabase: true
  updateUserHoldingNames<T extends DatabaseUserHoldingNames>(users: T[]): Promise<T[]>
  updateUsers<T extends DatabaseUserStat>(users: T[]): Promise<T[]>
  fetchUserHoldingNames(find: SearchParams): Promise<DatabaseUserHoldingNames | null>
  fetchAllUserHoldingNames(find: SearchParams): Promise<Array<DatabaseUserHoldingNames>>
  fetchUserStats({ id }: {id:number}): Promise<DatabaseUserStat | null>
  fetchAllUserStats?(): Promise<Array<DatabaseUserStat | null>>
}
