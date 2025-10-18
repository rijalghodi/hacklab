type SuccessResult<T> = readonly [T, null];
type ErrorResult<E> = readonly [null, E];
type Result<T, E> = SuccessResult<T> | ErrorResult<E>;
export async function tryCatch<T, E = Error>(fn: Promise<T> | (() => T)): Promise<Result<T, E>> {
  try {
    const data = typeof fn === "function" ? await fn() : await fn;
    return [data, null] as const;
  } catch (error) {
    return [null, error as E] as const;
  }
}
export function tryCatchSync<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    const data = fn();
    return [data, null];
  } catch (error) {
    return [null, error as E];
  }
}
