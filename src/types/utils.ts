export type NotEmpty<T> = Partial<T> & { [P in keyof T]: Required<Pick<T, P>> }[keyof T]
