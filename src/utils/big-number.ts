import Decimal from 'decimal.js';

/**
 *
 */
export const BigNumber = Decimal.clone({ precision: 100, maxE: 100 });

/**
 *
 * @param value
 * @param options
 */
export function toReadable(value: Decimal, options?: { decimals?: number; digitsAfterComma?: number }): string {
  const decimals = options?.decimals ?? 18;
  const digitsAfterComma = options?.digitsAfterComma ?? 8;

  return value.div(10 ** decimals).toFixed(digitsAfterComma, Decimal.ROUND_DOWN);
}
