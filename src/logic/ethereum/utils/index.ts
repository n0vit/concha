import DateTime from 'moment';
import { GENESIS_TIME, SECONDS_PER_SLOT, SLOTS_PER_EPOCH } from '@/constants';
import Decimal from 'decimal.js';

export function getTime(validatorSlot: number): DateTime.Moment {
  return DateTime.unix(GENESIS_TIME + validatorSlot * SECONDS_PER_SLOT);
}

export function timeToSlot(time: number): number {
  //1672531200
  // 1672531199 time slot 5475598
  const slots = time - GENESIS_TIME;
  return Math.floor(slots / SECONDS_PER_SLOT);
}

export function slotToEpoch(validatorSlot: number): number {
  return new Decimal(validatorSlot / SLOTS_PER_EPOCH).trunc().toNumber();
}

console.log(timeToSlot(1672531212));
