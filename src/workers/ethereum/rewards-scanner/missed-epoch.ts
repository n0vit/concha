import { WorkerService } from '@/services/shared/worker';
import { Logger } from 'winston';
import { getRewardsPerEpoch } from '@/logic/ethereum/scanner/get-rewards-per-epoh-all-validators';
import { getRewardsPerEpochSelectedValidators } from '@/logic/ethereum/scanner/get-rewards-per-epoh-selected-validators';
import { Networks, NetworkConfig, NetworksConfigs } from '@/config/networks';
import { PerformanceService } from '@/services/shared/performance';

/**
 *
 */
WorkerService.createWorker({
  name: `ethereum/scan-missed-epochs`,
  cron: WorkerService.everyFiveMinutes,
  workFunc: work,
  checkTimeValue: WorkerService.oneHourTimeValue,
  freezeLimitTimeValue: WorkerService.halfAnHourTimeValue,
  processName: 'ethereum-scan-missed-epochs'
});

async function work(logger: Logger) {
  const networks: Array<Networks> = [Networks.mainnet]; // for control with network should be scanned
  const configs = networks.map(n => NetworksConfigs[n]);
  logger.info(`Scanning ${networks} networks for current epoch rewards`);
  await Promise.all(configs.map(config => scanner(logger, config)));
}

export async function scanner(logger: Logger, config: NetworkConfig) {
  const loggerPrefix = `[${config.name}]`;
  logger.child({
    prefix: loggerPrefix
  });

  const { client, db } = config;
  const scanRangeEpochPerIteration = 10;
  const missedEpochs = await db.readMissedEpochs();
  const writePerformance = new PerformanceService();

  if (missedEpochs.length > 0) {
    const requestCount = Math.ceil(missedEpochs.length / scanRangeEpochPerIteration);
    for (let i = 0; i < requestCount; i++) {
      const step = i * scanRangeEpochPerIteration;
      const endStep = step + scanRangeEpochPerIteration;
      const asyncRequests = [];
      for (let j = step; j < (missedEpochs.length > endStep ? endStep : missedEpochs.length); j++) {
        const missedEpoch = missedEpochs[j];
        asyncRequests.push(
          missedEpoch.is_all_validators
            ? getRewardsPerEpoch(client, missedEpoch.epoch ?? 0)
            : getRewardsPerEpochSelectedValidators(
                client,
                missedEpoch.epoch ?? 0,
                missedEpoch.validator_indices?.map(v => v.toString()) ?? ['19558']
              )
        );
      }

      logger.debug(`call asyncRequests for missed epochs`);
      const epochRewardsArray = await Promise.all(asyncRequests);
      for (let index = 0; index < epochRewardsArray.length; index++) {
        const epochRewards = epochRewardsArray[index];

        if (epochRewards) {
          writePerformance.start();
          await db.writeEpochRewards(epochRewards);
          writePerformance.stop();

          logger.debug(
            `writed to db missed epoch  ${missedEpochs[step + index].epoch} in ${writePerformance.getResult()} s`
          );

          await db.deleteMissedEpoch(missedEpochs[step + index].id!);
        } else {
          logger.error(`scipped epoch ${step + index}`);
        }
      }
    }
  }
  logger.info('finish');
}
