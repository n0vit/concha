import { Epoch, Slot } from "@lodestar/types";
import { BeaconApi, Configuration, RewardsApi, ValidatorApi } from "../api";
import { ethers } from "ethers";

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
  slashingReward: number;
  slashingPenalty: number;
  proposalsMissed: number;
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
  slashingReward: 0,
  slashingPenalty: 0,
  // txDeeRewardWei: 0,
  proposalsMissed: 0,
  timestamp: 0,
  total: 0,

  epoch: 0,
};
export class RewardsPerEpoch {
  private beaconApi: BeaconApi;
  private validatorApi: ValidatorApi;
  private rewardApi: RewardsApi;
  private elApi: ethers.JsonRpcProvider;
  constructor(configuration: Configuration, basePathEL: string) {
    this.beaconApi = new BeaconApi(configuration);
    this.validatorApi = new ValidatorApi(configuration);
    this.rewardApi = new RewardsApi(configuration);
    this.elApi = new ethers.JsonRpcProvider(basePathEL);
  }

  private async getTime(validatorSlot: Slot, fisrtSlot: Slot) {
    try {
      const blockV2 = await this.beaconApi.getBlockV2(validatorSlot);
      const time = (
        await this.elApi.getBlock(
          blockV2.data.data.message.body.eth1_data.block_hash
        )
      )?.timestamp;
      return time;
    } catch (e) {
      const blockV2 = await this.beaconApi.getBlockV2(fisrtSlot);
      const time = (
        await this.elApi.getBlock(
          blockV2.data.data.message.body.eth1_data.block_hash
        )
      )?.timestamp;
      return time;
    }
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
      }>;

      const attestationsDutiesData: Record<
        string,
        { time: number; slot: number }
      > = {};

      for (let i = 0; i < attestationsDuties.length; i++) {
        const attestationDuty = attestationsDuties[i];
        const slot = Number(attestationDuty.slot);
        const time = await this.getTime(slot, epoch * 32);
        attestationsDutiesData[attestationDuty.validator_index] = {
          time: time ?? 0,
          slot: slot ?? 0,
        };
      }

      return attestations.map((at) => {
        const target = Number(at.target);
        const source = Number(at.source);
        const head = Number(at.head);
        return {
          validatorIndex: at.validator_index,
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

  // async getProposerReward(epoch: Epoch, validatorIndices: string[]) {
  //   console.log("start getProposerReward", epoch, validatorIndices);

  //   const proposerDutiesResponse = await this.validatorApi.getProposerDuties(
  //     epoch
  //   );
  //   const foundedPropsers: Record<
  //     string,
  //     { slotIncluded: boolean; txFee: number }
  //   > = {};
  //   console.log("pDRs", proposerDutiesResponse.data.data.length);
  //   if (proposerDutiesResponse.status === 200) {
  //     const proposerDuties = proposerDutiesResponse.data.data;
  //     for (let index = 0; index < proposerDuties.length; index++) {
  //       const proposer = proposerDuties[index];
  //       for (let i = 0; i < validatorIndices.length; i++) {
  //         if (proposer.validator_index === validatorIndices[i]) {
  //           console.log("found proposer", proposer);
  //           try {
  //             const blockV2 = await this.beaconApi.getBlockV2(proposer.slot);
  //             if (blockV2.status === 200) {
  //               const txFee = await this.getBlockFeeRewards(
  //                 blockV2.data.data.message.body.eth1_data.block_hash
  //               );
  //               foundedPropsers[proposer.validator_index] = {
  //                 slotIncluded: true,
  //                 txFee,
  //               };
  //             }
  //             throw new Error();
  //           } catch (e) {
  //             console.log("get proposer reward error", e);
  //             foundedPropsers[proposer.validator_index] = {
  //               txFee: 0,
  //               slotIncluded: false,
  //             };
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  async syncCommitteeRewards(slot: Slot, validatorIndices: string[]) {
    const syncCommitteeRewardsResponse =
      await this.rewardApi.getSyncCommitteeRewards(slot, validatorIndices);
    if (syncCommitteeRewardsResponse.status === 200) {
      return syncCommitteeRewardsResponse.data.data.map((s) => ({
        validatorIndex: s.validator_index,
        syncCommitteeReward: Number(s.reward),
      }));
    }
    return null;
  }
  async getBlockProposerRewards(slot: Slot) {
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

  public async getRewardsPerEpoch(epoch: Epoch, validatorIndices: string[]) {
    // console.log("start getRewardsPerEpoch", epoch, validatorIndices);
    try {
      const [attestationsRewards, proposerDutiesResponse, syncCommitteeDuties] =
        await Promise.all([
          this.getAttestationRewards(epoch, validatorIndices),
          this.validatorApi.getProposerDuties(epoch),
          this.validatorApi.getSyncCommitteeDuties(validatorIndices, epoch),
        ]);

      if (proposerDutiesResponse.status !== 200)
        throw new Error("getProposerDuties error");

      const proposerDuties = proposerDutiesResponse.data.data;
      const rewards: Record<string, ValidatorRewardsPerEpoch> = Object.assign(
        {},
        ...validatorIndices.map((v) => ({ [v]: baseRewardObject }))
      );

      const slotsPerEpoch = proposerDuties.length;
      const startSlot = epoch * slotsPerEpoch;
      const endSlot = startSlot + slotsPerEpoch - 1;
      const tmpCommitteResults = [];
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

      if (syncCommitteeDuties.data.data.length > 0) {
        for (let slotNumber = startSlot; slotNumber <= endSlot; slotNumber++) {
          console.log("get data for slot", slotNumber);
          try {
            const syncCommitteeRewards = await this.syncCommitteeRewards(
              slotNumber,
              validatorIndices
            );
            if (syncCommitteeRewards) {
              tmpCommitteResults.push(syncCommitteeRewards);
            }
          } catch (e) {
            console.log("get sync committee rewards error", slotNumber);
            continue;
          }
        }
      }
      for (let i = 0; i < validatorIndices.length; i++) {
        const vildator = validatorIndices[i];
        const vildatorRewards = rewards[vildator];
        const syncCommitteeTotalReward = tmpCommitteResults
          .flatMap((d) => d?.find((v) => v.validatorIndex === vildator))
          .reduce((a, b) => a + (b?.syncCommitteeReward ?? 0), 0);
        const proposerTotalRewards = tmpProposerResults
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
          );

        // console.log(
        //   "propserTotalRewards",
        //   tmpProposerResults,
        //   proposerTotalRewards
        // );
        // console.log(
        //   "syncCommitteeTotalReward",
        //   tmpCommitteResults,
        //   syncCommitteeTotalReward
        // );
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
          if (attestation.head > 0)
            vildatorRewards.attestationHeadReward = attestation.head;
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
        }

        const keys = Object.keys(vildatorRewards);
        let total = 0;
        for (let key of keys) {
          if (key !== "timestamp" && key !== "epoch" && key !== "total") {
            total += vildatorRewards[
              key as keyof typeof vildatorRewards
            ] as number;
          }
        }
        vildatorRewards.total = total;
        vildatorRewards.epoch = epoch;
      }
      console.log("rewards", JSON.stringify(rewards));
    } catch (e) {
      console.log("getRewardsPerEpoch error", e);
      return null;
    }
  }
}
// async getBlockFeeRewards(blockHash: string): Promise<number> {
//   console.log("start getBlockFeeRewards with blockHash:", blockHash);
//   const block = await this.elApi.getBlock(blockHash, true);
//   if (block) {
//     const txHashes = block.prefetchedTransactions.map((tx) => tx.hash);
//     console.log("txHashes", txHashes.length, txHashes[0]);
//     let totalFee = new Decimal(0);
//     if (txHashes.length > 0) {
//       for (let index = 0; index < txHashes.length; index++) {
//         const txHash = txHashes[index];
//         const txReceipt = await this.elApi.getTransactionReceipt(txHash);
//         if (txReceipt && txReceipt.gasUsed && txReceipt.gasPrice) {
//           totalFee.plus(
//             (txReceipt?.gasUsed * txReceipt?.gasPrice).toString()
//           );
//           console.log(
//             "getting hash no: ",
//             index,
//             (txReceipt.gasUsed * txReceipt.gasPrice).toString(),
//             totalFee
//           );
//         }
//       }
//     }
//     console.log("totalFee", totalFee);
//   }

//   return 0;
// }
