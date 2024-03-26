import { Epoch, Slot } from "@lodestar/types";
import { BeaconApi, Configuration, RewardsApi, ValidatorApi } from "../api";
import { ethers } from "ethers";

const GENESIS_TIME = 1606824023;
const SECONDS_PER_SLOT = 12;
const ALTAIR_EPOCH = 74240;
export interface ValidatorRewardsPerEpoch {
  attestationSourceReward: number;
  attestationSourcePenalty: number;
  attestationTargetReward: number;
  attestationTargetPenalty: number;
  attestationHeadReward: number;
  attestationSlot: number;
  finalityDelayPenalty: number;

  proposerSlashingInclusionReward: number;
  proposerAttestationInclusionReward: number;
  proposerSyncInclusionReward: number;

  syncCommitteeReward: number;
  syncCommitteePenalty: number;
  // slashingReward: number;
  // slashingPenalty: number;
  // proposalsMissed: number;
  timestamp: number;
  total: number;
  epoch: Epoch;
}

const baseRewardObject: ValidatorRewardsPerEpoch = {
  attestationSourceReward: 0,
  attestationSourcePenalty: 0,
  attestationTargetReward: 0,
  attestationTargetPenalty: 0,
  attestationHeadReward: 0,
  attestationSlot: 0,
  finalityDelayPenalty: 0,
  proposerSlashingInclusionReward: 0,
  proposerAttestationInclusionReward: 0,
  proposerSyncInclusionReward: 0,
  syncCommitteeReward: 0,
  syncCommitteePenalty: 0,
  // slashingReward: 0,
  // slashingPenalty: 0,
  // proposalsMissed: 0,
  timestamp: 0,
  total: 0,
  epoch: 0,
};
export class RewardsPerEpoch {
  // private beaconApi: BeaconApi;
  private validatorApi: ValidatorApi;
  private rewardApi: RewardsApi;
  private elApi: ethers.JsonRpcProvider;

  constructor(configuration: Configuration, basePathEL: string) {
    // this.beaconApi = new BeaconApi(configuration);
    this.validatorApi = new ValidatorApi(configuration);
    this.rewardApi = new RewardsApi(configuration);
    this.elApi = new ethers.JsonRpcProvider(basePathEL);
  }

  private getTime(validatorSlot: Slot): number {
    return GENESIS_TIME + validatorSlot * SECONDS_PER_SLOT;
  }

  private async getAttestationRewards(
    epoch: Epoch,
    validatorIndices: string[]
  ) {
    const [attestationsResponse, attestationDutiesResponse] = await Promise.all(
      [
        this.rewardApi.getAttestationsRewards(epoch, validatorIndices),
        this.validatorApi.getAttesterDuties(validatorIndices, epoch),
      ]
    );
    if (
      attestationsResponse.status === 200 &&
      attestationDutiesResponse.status === 200
    ) {
      const attestationsDuties = attestationDutiesResponse.data.data;
      const attestations = attestationsResponse.data.data
        .total_rewards as Array<{
        validator_index: string;
        head: string;
        target: string;
        source: string;
        inactivity: string;
        inclusion_delay: string;
      }>;

      const attestationsDutiesData: Record<
        string,
        { time: number; slot: number }
      > = {};

      for (let i = 0; i < attestationsDuties.length; i++) {
        const attestationDuty = attestationsDuties[i];
        const slot = Number(attestationDuty.slot);
        const time = this.getTime(slot);
        attestationsDutiesData[attestationDuty.validator_index] = {
          time,
          slot,
        };
      }

      return attestations.map((at) => {
        const target = Number(at.target);
        const source = Number(at.source);
        const head = Number(at.head);
        const inclusionDelay = Number(at.inclusion_delay);
        return {
          validatorIndex: at.validator_index,
          inclusionDelay,
          target,
          source,
          head,
          time: attestationsDutiesData[at.validator_index].time ?? 0,
          slot: attestationsDutiesData[at.validator_index].slot ?? 0,
        };
      });
    }
    return null;
  }

  private async getSyncCommitteeRewards(
    epoch: Epoch,
    slotsPerEpoch: number = 32,
    validatorIndices: string[]
  ) {
    if (epoch < ALTAIR_EPOCH) return null;
    try {
      const committeResults = [];
      const syncCommitteeDuties =
        await this.validatorApi.getSyncCommitteeDuties(validatorIndices, epoch);
      if (syncCommitteeDuties.data.data.length > 0) {
        const startSlot = epoch * slotsPerEpoch;
        const endSlot = startSlot + slotsPerEpoch - 1;

        for (let slotNumber = startSlot; slotNumber <= endSlot; slotNumber++) {
          console.log("get data for slot", slotNumber);
          try {
            const syncCommitteeRewards =
              await this.rewardApi.getSyncCommitteeRewards(
                slotNumber,
                validatorIndices
              );
            if (
              syncCommitteeRewards.status === 200 &&
              syncCommitteeRewards.data.data.length > 0
            ) {
              committeResults.push(
                syncCommitteeRewards.data.data.map((s) => ({
                  validatorIndex: s.validator_index,
                  syncCommitteeReward: Number(s.reward),
                }))
              );
            }
          } catch (e) {
            // console.log("get sync committee rewards error", slotNumber);
            continue;
          }
        }
      }
      return committeResults;
    } catch (e) {
      // console.log("syncCommitteeRewards error ", e);
      return null;
    }
  }
  private async getBlockProposerRewards(slot: Slot) {
    const rewardsResponse = await this.rewardApi.getBlockRewards(slot);
    if (rewardsResponse.status === 200) {
      const rewards = rewardsResponse.data.data;
      return {
        attestations: Number(rewards.attestations),
        proposerSlashingInclusion:
          Number(rewards.proposer_slashings) +
          Number(rewards.attester_slashings),
        syncAggregate: Number(rewards.sync_aggregate),
        validatorIndex: rewards.proposer_index,
      };
    }
    return null;
  }
  /**
   * Returns an object containing rewards for each validator in the specified epoch.
   * @param epoch The epoch for which to retrieve rewards.
   * @param validatorIndices The indices of the validators for whom to retrieve rewards.
   */
  public async getRewardsPerEpoch(epoch: Epoch, validatorIndices: string[]) {
    // console.log("start getRewardsPerEpoch", epoch, validatorIndices);
    try {
      const [attestationsRewards, proposerDutiesResponse] = await Promise.all([
        this.getAttestationRewards(epoch, validatorIndices),
        this.validatorApi.getProposerDuties(epoch),
      ]);

      if (proposerDutiesResponse.status !== 200)
        throw new Error("getProposerDuties error");

      const proposerDuties = proposerDutiesResponse.data.data;
      const rewards: Record<string, ValidatorRewardsPerEpoch> = {};

      const syncCommitteeRewards = await this.getSyncCommitteeRewards(
        epoch,
        proposerDuties.length,
        validatorIndices
      );
      const tmpProposerResults = [];

      console.log(
        "proposerData & att rewards",
        proposerDuties.length,
        attestationsRewards
      );

      for (let index = 0; index < proposerDuties.length; index++) {
        for (let i = 0; i < validatorIndices.length; i++) {
          if (proposerDuties[index].validator_index === validatorIndices[i]) {
            console.log("found proposer", proposerDuties[index]);
            const proposerRewards = await this.getBlockProposerRewards(
              Number(proposerDuties[index].slot)
            );
            if (proposerRewards) {
              tmpProposerResults.push(proposerRewards);
            }
          }
        }
      }

      for (let i = 0; i < validatorIndices.length; i++) {
        const vildator = validatorIndices[i];
        rewards[vildator] = Object.assign({}, baseRewardObject);
        const vildatorRewards = rewards[vildator];
        const syncCommitteeTotalReward =
          syncCommitteeRewards !== null
            ? syncCommitteeRewards
                .flatMap((d) => d?.find((v) => v.validatorIndex === vildator))
                .reduce((a, b) => a + (b?.syncCommitteeReward ?? 0), 0)
            : 0;
        const proposerTotalRewards =
          tmpProposerResults.length > 0
            ? tmpProposerResults
                .filter((pr) => pr.validatorIndex === vildator)
                .reduce(
                  (arr, curr) => {
                    arr.attestations += curr.attestations ?? 0;
                    arr.syncAggregate += curr.syncAggregate ?? 0;
                    arr.proposerSlashingInclusion +=
                      curr.proposerSlashingInclusion ?? 0;
                    return arr;
                  },
                  {
                    attestations: 0,
                    proposerSlashingInclusion: 0,
                    syncAggregate: 0,
                  }
                )
            : {
                attestations: 0,
                proposerSlashingInclusion: 0,
                syncAggregate: 0,
              };

        const attestation = attestationsRewards?.find(
          (at) => at.validatorIndex === vildator
        );

        vildatorRewards[
          syncCommitteeTotalReward < 0
            ? "syncCommitteePenalty"
            : "syncCommitteeReward"
        ] = syncCommitteeTotalReward;

        if (proposerTotalRewards) {
          if (proposerDuties)
            vildatorRewards.proposerAttestationInclusionReward =
              proposerTotalRewards.proposerSlashingInclusion;
          vildatorRewards.proposerAttestationInclusionReward =
            proposerTotalRewards.attestations;
          vildatorRewards.proposerSyncInclusionReward =
            proposerTotalRewards.syncAggregate;
        }

        if (attestation) {
          if (attestation.head > 0) {
            vildatorRewards.attestationHeadReward = attestation.head;
          }
          // else throw Error(`retrieved negative attestation head reward for validator ${vildator}, ${attestation.head}`)
          vildatorRewards[
            attestation.target > 0
              ? "attestationTargetReward"
              : "attestationTargetPenalty"
          ] = attestation.target;
          vildatorRewards[
            attestation.source > 0
              ? "attestationSourceReward"
              : "attestationSourceReward"
          ] = attestation.source;
          vildatorRewards.attestationSlot = attestation.slot;
          vildatorRewards.timestamp = attestation.time;

          if (attestation.inclusionDelay < 0) {
            vildatorRewards.finalityDelayPenalty = attestation.inclusionDelay;
          }
        }

        const keys = Object.keys(vildatorRewards);
        let total = 0;
        for (let key of keys) {
          if (
            key !== "timestamp" &&
            key !== "epoch" &&
            key !== "total" &&
            key !== "attestationSlot"
          ) {
            total += vildatorRewards[
              key as keyof typeof vildatorRewards
            ] as number;
          }
        }
        vildatorRewards.total = total;
        vildatorRewards.epoch = epoch;
      }

      console.log("rewards", JSON.stringify(rewards));
      return rewards;
    } catch (e) {
      console.log("getRewardsPerEpoch error", e);
      return null;
    }
  }
}
