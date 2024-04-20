import { Networks } from '@/config/networks';
import { BullQueue, BullWorker } from '@services/bull';
import { Job } from 'bullmq';

export interface EthHistoryScannerData {
  networkName: Networks;
  validatorIndices: string[];
}

export type EthHistoryScannerJob = Job<EthHistoryScannerData>;
export const EthHistoryQueue = new BullQueue<EthHistoryScannerData>('eth-history-scan', {
  defaultJobOptions: { backoff: 10 }
});

export const createEthHistoryWorker = (process: (job: Job<EthHistoryScannerData>) => any) =>
  new BullWorker<EthHistoryScannerData>('eth-history-scan', process, {
    removeOnFail: { count: 10 },
    removeOnComplete: { count: 10 },
    runRetryDelay: 3000
  });
