import { AppError } from './errors';

interface ErrorLike {
  status?: number;
  message?: string;
  ctx?: any;
}

/**
 *
 * @param {Boolean} condition
 * @param {Object} error
 * @param {Number} error.status
 * @param {String} error.message
 */
export function assert(condition: boolean, error: ErrorLike = {}): asserts condition {
  const { status = 400, message = 'BAD_REQUEST' } = error;

  if (!condition) {
    const appError = new AppError(status, message);
    throw appError;
  }
}

/**
 *
 * @param {T} value
 * @param {Object} error
 * @param {Number} error.status
 * @param {String} error.message
 */
export function assertIsNotNil<T = any>(value: any, error: ErrorLike = {}): asserts value is NonNullable<T> {
  assert(value !== undefined && value !== null, error);
}

/**
 *
 * @param {*} value
 * @param {Object} error
 * @param {Number} error.status
 * @param {String} error.message
 */
export function assertIsNumber(value: any, error: ErrorLike = {}): asserts value is number {
  assert(typeof value === 'number' && Number.isNaN(value) === false, error);
}

/**
 *
 * @param {*} value
 * @param {Object} error
 * @param {Number} error.status
 * @param {String} error.message
 */
export function assertIsString(value: any, error: ErrorLike = {}): asserts value is string {
  assert(typeof value === 'string', error);
}

/**
 *
 * @param {*} value
 * @param {Object} error
 * @param {Number} error.status
 * @param {String} error.message
 */
export function assertIsBoolean(value: any, error: ErrorLike = {}): asserts value is boolean {
  assert(typeof value === 'boolean', error);
}

/**
 *
 * @param {*} value
 * @param {Object} error
 * @param {Number} error.status
 * @param {String} error.message
 */
export function assertIsObject<T = object>(value: any, error: ErrorLike = {}): asserts value is T {
  assertIsNotNil<T>(value, error);
  assert(typeof value === 'object' && Array.isArray(value) === false, error);
}

/**
 *
 * @param {*} value
 * @param {Object} error
 * @param {Number} error.status
 * @param {String} error.message
 */
export function assertIsArray<T = any>(value: any, error: ErrorLike = {}): asserts value is Array<T> {
  assert(Array.isArray(value), error);
}
