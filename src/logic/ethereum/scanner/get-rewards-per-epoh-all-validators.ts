import type { EthClient } from '@/services/private/ethrereum/eth-client';
import { PerformanceService } from '@/services/shared/performance';
import type { AttestationReward, ProposerReward, SyncCommitteeReward } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Get the total rewards earned by a vildators for a specific epoch.
 *
 * @param client - The rewards client instance.
 * @param epoch - The epoch number.
 * @returns The total rewards earned for the specified epoch.
 */

export async function getRewardsPerEpoch(
  client: EthClient,
  epoch: number
): Promise<{
  attestationsRewards: Array<AttestationReward>;
  proposersRewards: Array<ProposerReward>;
  syncCommitteeRewards: Array<SyncCommitteeReward>;
  epoch: number;
  validatorIndices: string[];
} | null> {
  try {
    const executionPerformance = new PerformanceService();
    executionPerformance.start();
    const proposerDuties = await client.getProposersDuties(epoch);
    const slotsToProposerIndex = Object.fromEntries(proposerDuties) as Record<number, number>;

    const attestationsRewards = await client.getAttestationRewards(epoch);
    const proposersRewards: Array<ProposerReward> = [];
    let syncCommitteeRewards: Array<NonNullable<Awaited<ReturnType<typeof client.getSyncCommitteeRewards>>>[0]> = [];
    const slotsPerEpoch = proposerDuties.length;
    const startSlot = epoch * slotsPerEpoch;
    const endSlot = startSlot + slotsPerEpoch - 1;

    for (let slot = startSlot; slot < endSlot; slot++) {
      const validatorIndex = slotsToProposerIndex[slot];

      if (validatorIndex !== undefined) {
        const proposerReward = await client.getBlockProposerRewards(epoch, slot);

        if (proposerReward) {
          proposersRewards.push(proposerReward);
        } else {
          proposersRewards.push({
            exReward: null,
            validatorIndex,
            proposerSlot: slot,
            proposalMissed: 1,
            attestationsInclusion: 0,
            slashingInclusion: 0,
            syncAggregateInclusion: 0,
            epoch
          });
        }
      }

      const slotSyncCommitteeRewards = await client.getSyncCommitteeRewards(epoch, slot);
      if (slotSyncCommitteeRewards) {
        syncCommitteeRewards = syncCommitteeRewards.concat(slotSyncCommitteeRewards);
      }
    }

    executionPerformance.stop();

    logger.info(
      `Successfully scanned epoch = ${epoch}, found rewards for all valodators  in epoch, within ${executionPerformance.getResult()} s`
    );
    return {
      attestationsRewards,
      proposersRewards,
      syncCommitteeRewards,
      epoch,
      validatorIndices: attestationsRewards.map(att => att.validatorIndex.toString())
    };
  } catch (e) {
    logger.error('Error scan all validator for epoch', e);
    return null;
  }
}
