import { EthClient, EthDBService, EthCacheService } from '@/services/private/ethrereum';
import { getRewardsPerEpochSelectedValidators, getRewardsPerEpoch, ValidatorsFilter } from '@/logic/ethereum/scanner';
import { PerformanceService } from '@services/performance';
import { NetworksConfigs } from '@/config/networks';
import { createLoggingMoudule } from '@/utils';
import {
  createEthHistoryWorker,
  EthHistoryScannerJob,
  EthHistoryScannerData
} from '@/services/private/ethrereum/eth-mq';
import { DEFAULT_START_HISTORY_EPOCH } from '@/constants';

createEthHistoryWorker(async (job: EthHistoryScannerJob) => {
  return await work(job.data, job.id ?? job.name);
});

async function work(data: EthHistoryScannerData, jobId: string) {
  const logger = createLoggingMoudule(`ethereum-history-scan-worker`);
  const scanPerformance = new PerformanceService();
  logger.info(`Starting execute job ${jobId} data: ${JSON.stringify(data)}`);

  scanPerformance.start();
  const scanRangeEpochPerIteration = 10;
  const { networkName, validatorIndices } = data;
  const { cache, client, clients, db } = NetworksConfigs[networkName];
  const filter = new ValidatorsFilter(client, cache);

  const startEpoch = 277692;
  const [lastScannedEpoch, currentEpoch] = await Promise.all([
    await cache.getLastScannedEpoch(),
    await client.getLastFinalizedEpoch()
  ]);

  // +1 for end scan sycle with current epoch worker
  let endEpoch = (lastScannedEpoch ?? currentEpoch) + 1;
  //node 2
  // 1000 start  end 4999
  // EpocsForNode 2000
  // cycle 1
  // startStep = 1000 + (EpocsForNode=2000 * nodeIndex=0) = 1000
  // endStep = startStep=1000 + EpocsForNode=2000  = 3000
  //cycle 2
  //  startStep = 1000 + (EpocsForNode=2000 * nodeIndex=1) = 3000
  // endStep = startStep=3000 + EpocsForNode=2000  = min(5000, end=4999)= 4999
  const scanLength = endEpoch - startEpoch;
  const requestArray = [];
  const EpocsForNode = Math.ceil(scanLength / clients.length);
  for (let nodeIndex = 0; nodeIndex < clients.length; nodeIndex++) {
    const client = clients[nodeIndex];
    const startStep = startEpoch + EpocsForNode * nodeIndex;
    const endStep = Math.min(startStep + EpocsForNode, endEpoch);
    requestArray.push(
      Iterator(
        { client, cache, filter, db },
        { startEpoch: startStep, endEpoch: endStep, validatorIndices, scanRangeEpochPerIteration },
        jobId,
        nodeIndex
      )
    );
  }

  const nodeResults = await Promise.allSettled(requestArray);

  nodeResults.forEach((result, i) => logger.info(`Interation ${JSON.stringify(result)}`));

  logger.info(
    `finish job ${jobId} for validarors ${validatorIndices.length} in ${scanPerformance.getResult()} seconds`
  );
  return jobId;
}

async function Iterator(
  config: {
    client: EthClient;
    cache: EthCacheService;
    db: EthDBService;
    filter: ValidatorsFilter;
  },
  scan: {
    startEpoch: number;
    endEpoch: number;
    scanRangeEpochPerIteration: number;
    validatorIndices: string[];
  },
  jobId: string,
  nodeIndex: number
) {
  const { startEpoch, endEpoch, scanRangeEpochPerIteration, validatorIndices } = scan;
  const { client, cache, db, filter } = config;

  const scanHistorylog = createLoggingMoudule(`hisrory-scan:job:${jobId}:node:${nodeIndex}`);

  scanHistorylog.info(
    `Start iterator From: ${startEpoch} epoch To: ${endEpoch} epoch(not included) nodeIndex: ${nodeIndex}`
  );
  const startIterationTime = performance.now();
  let maxEpochForIteration = startEpoch;
  for (let i = startEpoch; i < endEpoch; i += scanRangeEpochPerIteration) {
    maxEpochForIteration = i + scanRangeEpochPerIteration;

    if (maxEpochForIteration >= endEpoch) maxEpochForIteration = endEpoch;

    const asyncRequests = [];

    const filterdValidatorIndices = await filter.checkValidatorsEpochsForHistoryScan(
      validatorIndices,
      i,
      maxEpochForIteration
    );

    for (let j = 0; j < maxEpochForIteration - i; j++) {
      const epoch = j + i;
      if (validatorIndices.length) {
        if (filterdValidatorIndices[j].length) {
          asyncRequests.push(getRewardsPerEpochSelectedValidators(client, epoch, filterdValidatorIndices[j]));
        }
      } else {
        asyncRequests.push(getRewardsPerEpoch(client, j));
      }
    }
    scanHistorylog.debug(`try call asyncRequests for epoch ${i} - ${maxEpochForIteration - 1}`);
    const epochRewardsArray = await Promise.all(asyncRequests);

    scanHistorylog.debug(
      `get epochRewardsArray length: ${epochRewardsArray.length} for epoch ${i} - ${maxEpochForIteration - 1}`
    );
    for (let index = 0; index < epochRewardsArray.length; index++) {
      const epochRewards = epochRewardsArray[index];

      if (epochRewards) {
        const writeStartedAt = performance.now();
        await db.writeEpochRewards(epochRewards);
        await cache.updatedValidatorsDataHistory(epochRewards.validatorIndices, epochRewards.epoch);
        const writeEndedAt = performance.now();
        const writeDuration = Math.trunc(writeEndedAt - writeStartedAt) / 1000;
        scanHistorylog.debug(`writed to db epoch: ${epochRewards.epoch} in ${writeDuration} s`);
      } else {
        scanHistorylog.error(`scipped epoch: ${i + index} rows: 0`);
        await db.writeMissedEpoch(i + index, validatorIndices, validatorIndices.length === 0);
      }
    }
  }
  const EndIterationTime = performance.now();
  const sacnDuration = Math.trunc(EndIterationTime - startIterationTime) / 1000;
  scanHistorylog.info('finish');
  return { sacnDuration, startEpoch, endEpoch, nodeIndex };
}
