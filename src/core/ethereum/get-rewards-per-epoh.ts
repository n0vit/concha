import { RewardsClient } from "../../services/client";
import { ValidatorRewardsBase } from "../../entites/validator-rewards";
import { logger } from "../../utils";

/**
 * Get the total rewards earned by a vildators for a specific epoch.
 *
 * @param client - The rewards client instance.
 * @param epoch - The epoch number.
 * @returns The total rewards earned for the specified epoch.
 */

export async function getRewardsPerEpoch(client: RewardsClient, epoch: number) {
  try {
    const scanStartedAt = performance.now();
    const proposerDuties = await client.getProposersDuties(epoch);

    const rewards: Record<number, ValidatorRewardsBase> = {};
    const slotsToProposerIndex = Object.fromEntries(proposerDuties) as Record<
      number,
      number
    >;

    const attestationsRewards = await client.getAttestationRewards(epoch);

    const slotsPerEpoch = proposerDuties.length;
    const startSlot = epoch * slotsPerEpoch;
    const endSlot = startSlot + slotsPerEpoch - 1;

    for (let index = startSlot; index < endSlot; index++) {
      const validatorIndex = slotsToProposerIndex[index];
      if (validatorIndex !== undefined) {
        // console.log(
        //   "found proposer",
        //   slotsToProposerIndex[index],
        //   "for slot",
        //   index
        // );
        const proposerRewards = await client.getBlockProposerRewards(index);
        if (proposerRewards) {
          if (rewards[validatorIndex] === undefined) {
            rewards[validatorIndex] = new ValidatorRewardsBase();
          }

          rewards[validatorIndex].proposerAttestationInclusionReward +=
            proposerRewards.attestations;
          rewards[validatorIndex].proposerSlashingInclusionReward +=
            proposerRewards.proposerSlashingInclusion;
          rewards[validatorIndex].proposerSyncInclusionReward +=
            proposerRewards.syncAggregate;
        } else {
          if (rewards[validatorIndex] === undefined) {
            rewards[validatorIndex] = new ValidatorRewardsBase();
          }
          rewards[validatorIndex].proposalsMissed += 1;
        }
      }

      const syncCommitteeRewards = await client.getSyncCommitteeRewards(
        epoch,
        index
      );

      syncCommitteeRewards?.forEach((syncCommitteeReward) => {
        if (rewards[syncCommitteeReward.validatorIndex] === undefined) {
          rewards[syncCommitteeReward.validatorIndex] =
            new ValidatorRewardsBase();
        }
        if (syncCommitteeReward.syncCommitteeReward > 0) {
          rewards[syncCommitteeReward.validatorIndex].syncCommitteeReward =
            syncCommitteeReward.syncCommitteeReward;
        } else {
          rewards[syncCommitteeReward.validatorIndex].syncCommitteePenalty =
            syncCommitteeReward.syncCommitteeReward;
        }
      });
    }

    attestationsRewards?.forEach((attestationsReward) => {
      const validatorIndex = attestationsReward.validatorIndex;
      if (rewards[validatorIndex] === undefined) {
        rewards[validatorIndex] = new ValidatorRewardsBase();
      }
      const validator = rewards[validatorIndex];

      if (attestationsReward.head > 0) {
        validator.attestationHeadReward = attestationsReward.head;
      }

      if (attestationsReward.source > 0) {
        validator.attestationSourceReward = attestationsReward.source;
      } else {
        validator.attestationSourcePenalty = attestationsReward.source;
      }

      if (attestationsReward.target > 0) {
        validator.attestationTargetReward = attestationsReward.target;
      } else {
        validator.attestationTargetPenalty = attestationsReward.target;
      }

      if (attestationsReward.inclusionDelay < 0) {
        validator.finalityDelayPenalty = attestationsReward.inclusionDelay;
      }

      validator.validatorAddress = attestationsReward.validatorAddress;
      validator.attestationSlot = attestationsReward.slot;
      validator.timestamp = attestationsReward?.time;
      validator.epoch = epoch;
      validator.total =
        validator.attestationHeadReward +
        validator.attestationSourceReward +
        validator.attestationTargetReward +
        validator.syncCommitteeReward +
        validator.proposerAttestationInclusionReward +
        validator.proposerSlashingInclusionReward +
        validator.proposerSyncInclusionReward +
        validator.finalityDelayPenalty +
        validator.attestationSourcePenalty +
        validator.attestationTargetPenalty +
        validator.syncCommitteePenalty;
    });

    const scanEndedAt = performance.now();
    const scanDuration = Math.trunc(scanEndedAt - scanStartedAt) / 1000;

    logger.info(
      `Successfully scanned epoch = ${epoch}, found rewards for valodators ${
        Object.keys(rewards).length
      } within ${scanDuration} s`
    );
    return rewards;
  } catch (e) {
    console.error(e);
    logger.error("Error for scanning epoch", e);
    return null;
  }
}
