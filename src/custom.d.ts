declare module "promise-timeout" {
  export function timeout<T>(promise: T, ms: number): T;

  export class TimeoutError extends Error {}
}
