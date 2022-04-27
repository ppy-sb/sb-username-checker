import { SearchParams } from 'plugin/config'
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
  changes(): any[]
}
export interface DatabaseUserStat extends UserStat, DatabaseAddon<DatabaseUserStat> {}
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
// export interface SingleShotSource {
//   fetchAllUserHoldingNames(afterDate: Date): Promise<UserHoldingNames[]>
//   approve(users: UserHoldingNames[]): void
//   reject(users: UserHoldingNames[]): void
// }
// export interface StreamSource {
//   fetchAllUserHoldingNames(afterDate: Date): Promise<UserHoldingNames[]>
//   approve(users: UserHoldingNames[]): void
//   reject(users: UserHoldingNames[]): void
// }

// export type Source = StreamSource | SingleShotSource
