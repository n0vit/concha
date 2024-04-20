import { dbClients, exec } from '@/services/shared/database';
import { SimpleCache } from '@/services/shared/redis/simple-cache';
import { WorkerService } from '@/services/shared/worker';
import { Slot, Withdrawal } from '@/types';
import process from 'process';
import format from 'pg-format';

import { Logger } from 'winston';
import { NetworksConfigs } from '@/config/networks';
// FIXME: refator for other netwoks
const CAPELLA_SLOT = 6209538;
const client = NetworksConfigs.mainnet.client;
/**
 *
 */
WorkerService.createWorker({
  name: `ethereum/withdrawals-history`,
  cron: WorkerService.everyHour,
  workFunc: workHistory,
  isDevelopment: true,
  checkTimeValue: WorkerService.oneHourTimeValue,
  freezeLimitTimeValue: WorkerService.halfAnHourTimeValue,
  processName: 'ethereum-withdrawals-history'
});

/**
 *
 */
WorkerService.createWorker({
  name: `ethereum/withdrawals-current`,
  cron: WorkerService.everyFiveMinutes,
  workFunc: workCurrent,
  isDevelopment: false,
  checkTimeValue: WorkerService.oneHourTimeValue,
  freezeLimitTimeValue: WorkerService.halfAnHourTimeValue,
  processName: 'ethereum-withdrawals-currenct'
});
async function workHistory(logger: Logger): Promise<void> {
  console.log('is BUN', process.isBun);
  // const lastScannedSlost = CAPELLA_SLOT;
  const lastScannedSlost = Math.max(
    (await SimpleCache.get<number>('withdrawals_history:last_scanned_slot', CAPELLA_SLOT)) ?? CAPELLA_SLOT
  );

  let endScannedSlot =
    (await SimpleCache.get('withdrawals_current:last_scanned_slot', null)) ??
    (await client.getFinalized())?.eth2Slot ??
    CAPELLA_SLOT;
  const step = 128;
  let shoudCheckSlot = true;
  const statScanSlot = lastScannedSlost + 1;
  let maxSlotForIteration = statScanSlot;
  for (let i = statScanSlot; i <= endScannedSlot; i += step) {
    maxSlotForIteration = i + step;

    if (shoudCheckSlot) {
      //check if slot exist in db

      const slotExist = await slotExistInDb(i, maxSlotForIteration);
      if (slotExist) continue;
    }

    if (maxSlotForIteration > endScannedSlot) {
      endScannedSlot = Math.max(
        (await SimpleCache.get('withdrawals_current:last_scanned_slot', null)) ??
          (await client.getFinalized())?.eth2Slot ??
          endScannedSlot
      );
      if (endScannedSlot < maxSlotForIteration) maxSlotForIteration = endScannedSlot;
    }

    console.log('start scan from ', i, maxSlotForIteration);
    const asyncRequests = [];
    for (let j = i; j < maxSlotForIteration; j++) {
      asyncRequests.push(client.getWithdrawalsBySlot(j));
    }

    const withdrawals = await Promise.all(asyncRequests);
    for (let slotWithdrawals = 0; slotWithdrawals < withdrawals.length; slotWithdrawals++) {
      const withdrawal = withdrawals[slotWithdrawals];
      if (withdrawal) {
        await saveWithdrawals(withdrawal);
      }
      await SimpleCache.set('withdrawals_history:last_scanned_slot', slotWithdrawals + i);
    }
  }
}

async function workCurrent(logger: Logger): Promise<void> {
  const head = await client.getFinalized();
  const headSlot = head?.eth2Slot ?? 0;
  const lastScannedSlost = await SimpleCache.get('withdrawals_current:last_scanned_slot', 0);
  const startSlot = lastScannedSlost ? lastScannedSlost + 1 : headSlot;

  console.log('start scan from ', startSlot, 'to', head?.eth2Slot);
  const slostExists = await slotExistInDb(startSlot, headSlot);
  if (slostExists || startSlot > headSlot) {
    console.log('slost exists', lastScannedSlost, headSlot);
  }
  for (let slot = startSlot; slot < headSlot + 1; slot++) {
    const withdrawals = await client.getWithdrawalsBySlot(slot);
    if (withdrawals) {
      await saveWithdrawals(withdrawals);
      await SimpleCache.set('withdrawals_current:last_scanned_slot', slot);
      console.log('current save', withdrawals[0].slot, withdrawals.length);
    }
  }
}
//TODO: Move to Services
async function slotExistInDb(startSlot: Slot, endSlot: Slot) {
  return (
    (
      await exec(
        `(SELECT withdrawal_index from withdrawals_mainnet WHERE slot=$1 LIMIT 1)
          UNION
         (SELECT withdrawal_index from withdrawals_mainnet WHERE slot=$2 LIMIT 1)
        `,
        [startSlot, endSlot],
        dbClients.local
      )
    ).rowCount == 2
  );
}

async function saveWithdrawals(withdrawals: Withdrawal[]) {
  //TODO: Move to Services
  try {
    await exec(
      format(
        'INSERT INTO withdrawals_mainnet (withdrawal_index, slot, block_number,validator_index,  amount, address) VALUES %L',
        withdrawals.map(w => [w.withdrawalId, w.slot, w.blockNumber, w.validatorIndex, w.amount, w.address])
      ),
      [],
      dbClients.local
    );
  } catch (e) {
    // console.log(e);
  }
}
