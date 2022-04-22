import { SearchParams } from 'plugin/config'
export interface UserInfo {
  id: number,
  name: string,
  name_safe: string,
  email: string,
  banned: boolean
}
export interface User {
  _id: number,
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
  approve(): void,
  reject(reason: string): void
  getUserInfo(): Promise<UserInfo | null>
}
export interface Database {
  fetchAllUserNameHistories(find: SearchParams): Promise<User[]>
  start(): void
  stop(): void
  approve(users: User[]): void
  reject(users: User[]): void
  fetchUserStats({ id }: {id:number}): Promise<UserInfo | null>
}
// export interface SingleShotDatabase {
//   fetchAllUserNameHistories(afterDate: Date): Promise<User[]>
//   approve(users: User[]): void
//   reject(users: User[]): void
// }
// export interface StreamDatabase {
//   fetchAllUserNameHistories(afterDate: Date): Promise<User[]>
//   approve(users: User[]): void
//   reject(users: User[]): void
// }

// export type Database = StreamDatabase | SingleShotDatabase
