import type { EthClient } from '@/services/private/ethrereum';
import type { AttestationReward, Epoch, ProposerReward, SyncCommitteeReward } from '@/types';
import { logger } from '@/utils/logger';

export async function getRewardsPerEpochSelectedValidators(
  client: EthClient,
  epoch: Epoch,
  validatorIndices: string[]
): Promise<{
  attestationsRewards: Array<AttestationReward>;
  proposersRewards: Array<ProposerReward>;
  syncCommitteeRewards: Array<SyncCommitteeReward>;
  epoch: number;
  validatorIndices: string[];
} | null> {
  try {
    const scanStartedAt = performance.now();
    const [attestationsRewards, proposersData] = await Promise.all([
      client.getSelectedAttestationRewards(epoch, validatorIndices),
      client.getSelectedBlockProposerRewards(epoch, validatorIndices)
    ]);
    const syncCommitteeRewards = await client.getSelectedSyncCommitteeRewards(
      epoch,
      proposersData.slotPerEpoch ?? 32,
      validatorIndices
    );

    const scanEndedAt = performance.now();
    const scanDuration = Math.trunc(scanEndedAt - scanStartedAt) / 1000;
    logger.info(
      `Successfully scanned epoch = ${epoch}, found rewards for selected valodators ${validatorIndices.length} within ${scanDuration} s`
    );
    return {
      attestationsRewards,
      proposersRewards: proposersData.proposersResults ?? [],
      syncCommitteeRewards: syncCommitteeRewards ?? [],
      epoch,
      validatorIndices
    };
  } catch (e) {
    logger.error('Error scan selected validator for epoch', e);
    return null;
  }
}
