import { SearchParams } from 'plugin/config'
export interface User {
  _id: any,
  id: number,
  name: string,
  name_safe: string,
  is_active: boolean,
  create_time: number,
  inappropriate_check_date: Date,
  inappropriate_checker_version: number,
  _rejected: boolean
  _rejectReason: string[],
  reject_reason: string,
  _checkResult: {
    name?: string[]
    nameSafe?: string[]
  }
  approve: () => void,
  reject: (reason: string) => void
}
export interface Database {
  fetchUsers(find: SearchParams): Promise<User[]>
  start(): void
  stop(): void
  approve(users: User[]): void
  reject(users: User[]): void
}
// export interface SingleShotDatabase {
//   fetchUsers(afterDate: Date): Promise<User[]>
//   approve(users: User[]): void
//   reject(users: User[]): void
// }
// export interface StreamDatabase {
//   fetchUsers(afterDate: Date): Promise<User[]>
//   approve(users: User[]): void
//   reject(users: User[]): void
// }

// export type Database = StreamDatabase | SingleShotDatabase
