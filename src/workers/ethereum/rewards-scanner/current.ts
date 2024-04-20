import { getRewardsPerEpochSelectedValidators } from '@/logic/ethereum/scanner/get-rewards-per-epoh-selected-validators';
import { WorkerService } from '@/services/shared/worker';
import type { Logger } from 'winston';
import { ValidatorsFilter } from '@/logic/ethereum/scanner/filter-validators';
import { Networks, NetworkConfig, NetworksConfigs } from '@/config/networks';

/**
 *
 */
WorkerService.createWorker({
  name: `ethereum/current-epoch-rewards-scanner`,
  cron: WorkerService.everyFiveMinutes,
  workFunc: work,
  isDevelopment: false,
  checkTimeValue: WorkerService.oneHourTimeValue,
  freezeLimitTimeValue: WorkerService.halfAnHourTimeValue,
  processName: 'ethereum-current-epoch-rewards-scanner'
});

async function work(logger: Logger) {
  const networks: Array<Networks> = [Networks.mainnet];
  const configs = networks.map(n => NetworksConfigs[n]);
  logger.info(`Scanning ${networks} networks for current epoch rewards`);
  await Promise.all(configs.map(config => scanner(logger, config)));
}

async function scanner(logger: Logger, config: NetworkConfig) {
  const { cache, client, db, name: networkName } = config;

  const loggerPrefix = `[${networkName}]`;
  logger.child({
    prefix: loggerPrefix
  });

  logger.info('start scan new rewards');
  const filter = new ValidatorsFilter(client, cache);
  const currentEpoch = await client.getLastFinalizedEpoch();
  const lastScannedEpoch = await cache.getLastScannedEpoch();

  if (lastScannedEpoch && lastScannedEpoch >= currentEpoch) {
    logger.info('not found new epochs to scan rewards');
    return;
  }

  const endEpoch = currentEpoch + 1;
  const startEpoch = lastScannedEpoch ? lastScannedEpoch + 1 : currentEpoch;
  const validators = await filter.getValidatorsForCurrentScan(startEpoch, endEpoch);

  const scanLength = endEpoch - startEpoch;

  logger.info(`start scan new epochs from ${startEpoch} to ${currentEpoch}`);
  if (validators.length) {
    for (let index = 0; index < scanLength; index++) {
      const validatorForEpoch = validators[index];
      if (validatorForEpoch.length) {
        const epoch = startEpoch + index;
        logger.debug(`found ${validatorForEpoch.length} validators for epoch ${epoch}`);

        const rewards = await getRewardsPerEpochSelectedValidators(client, epoch, validatorForEpoch);

        if (rewards) {
          await db.writeEpochRewards(rewards);
          await cache.setLastScannedEpoch(epoch);
        } else {
          await db.writeMissedEpoch(epoch, validatorForEpoch, false);
        }
      } else {
        logger.info('not found validators to scan rewards');
        logger.info(`set last scanned epoch to current epoch ${currentEpoch}`);
        await cache.setLastScannedEpoch(currentEpoch);
      }
    }
  } else {
    logger.info('not found  validators to scan rewards');
    logger.info(`set last scanned epoch to current epoch ${currentEpoch}`);
    await cache.setLastScannedEpoch(currentEpoch);
  }

  logger.info('stop');
}
