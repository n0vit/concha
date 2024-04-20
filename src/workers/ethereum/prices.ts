import { WorkerService } from '@/services/shared/worker';
import { getTime } from '@/logic/ethereum/utils';
import { Logger } from 'winston';
import { NetworksConfigs } from '@/config/networks';

/**
 *
 */
WorkerService.createWorker({
  name: `ethereum/prices`,
  cron: WorkerService.everyMinute,
  workFunc: work,
  checkTimeValue: WorkerService.oneHourTimeValue,
  freezeLimitTimeValue: WorkerService.halfAnHourTimeValue,
  processName: 'ethereum-prices'
});

async function work(logger: Logger): Promise<void> {
  const currencyId = 'ETHEREUM2';

  const loggerPrefix = `[${currencyId}]`;
  logger.child({
    prefix: loggerPrefix
  });

  const db = NetworksConfigs.mainnet.db;
  const tabels = ['attestation_rewards_mainnet', 'sync_committee_rewards_mainnet', 'proposer_rewards_mainnet'];

  for (const table of tabels) {
    const slots = await db.readSlotsWithPirceIsNull(table);
    if (slots.length) {
      for (const slotData of slots) {
        const prices = await db.readPrice(currencyId, getTime(slotData.slot));
        if (prices) {
          await db.updateSlotPrice(table, slotData, prices);
        } else {
          logger.error(`Can't get price for slot ${slotData.slot}`);
        }
      }
    }
  }
}
