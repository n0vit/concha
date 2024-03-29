import { Epoch, Slot } from "@/types";
import {
  BeaconApi,
  Configuration,
  EventsApi,
  RewardsApi,
  ValidatorApi,
} from "../api";
import { ethers } from "ethers";
import DateTime from "moment";
import { createLoggingMoudule } from "@/utils";
import type { Logger } from "winston";

const GENESIS_TIME = 1606824023;
const SECONDS_PER_SLOT = 12;
const ALTAIR_EPOCH = 74240;

export class RewardsClient {
  private beaconApi: BeaconApi;
  private validatorApi: ValidatorApi;
  private eventApi: EventsApi;
  private rewardApi: RewardsApi;
  private elApi: ethers.JsonRpcProvider;

  private logger: Logger;
  constructor(configuration: Configuration, basePathEL: string) {
    this.logger = createLoggingMoudule("RewardsClient");
    this.eventApi = new EventsApi(configuration);
    this.beaconApi = new BeaconApi(configuration);
    this.validatorApi = new ValidatorApi(configuration);
    this.rewardApi = new RewardsApi(configuration);
    this.elApi = new ethers.JsonRpcProvider(basePathEL);
  }

  private getTime(validatorSlot: Slot): string {
    return DateTime.unix(
      GENESIS_TIME + validatorSlot * SECONDS_PER_SLOT
    ).toISOString(false);
  }

  private async getAttestersDuties(
    epoch: number,
    validatorIndices: Array<string>
  ) {
    const attestationsDutiesData: Record<
      string,
      { time: string; slot: number; address: string }
    > = {};

    let requestCount = 1;
    const requestLimint = 100000;
    //max validatorIndices 50000 per 1 request
    if (validatorIndices.length > requestLimint) {
      requestCount = Math.ceil(validatorIndices.length / requestLimint);
    }
    const requestArray = [];
    for (let i = 0; i < requestCount; i++) {
      const step = i * requestLimint;
      const endStep = step + requestLimint;
      requestArray.push(
        this.validatorApi.getAttesterDuties(
          validatorIndices.slice(
            step,
            validatorIndices.length > endStep ? endStep : undefined
          ),
          epoch
        )
      );
    }

    const attestationDutiesResponse = await Promise.all(requestArray);

    for (let r = 0; r < attestationDutiesResponse.length; r++) {
      const attestationsDuties = attestationDutiesResponse[r].data.data;

      for (let i = 0; i < attestationsDuties.length; i++) {
        const attestationDuty = attestationsDuties[i];
        const slot = Number(attestationDuty.slot);
        const time = this.getTime(slot);
        attestationsDutiesData[attestationDuty.validator_index] = {
          time,
          slot,
          address: attestationDuty.pubkey,
        };
      }
    }
    return attestationsDutiesData;
  }

  public async getLastFinalizedEpoch(): Promise<number> {
    return (
      (await this.beaconApi.getStateFinalityCheckpoints("finalized")).data.data
        .finalized.epoch ?? 0
    );
  }

  public async getProposersDuties(epoch: Epoch) {
    return (await this.validatorApi.getProposerDuties(epoch)).data.data.map(
      (v) => [Number(v.slot), v.validator_index]
    );
  }

  public async subscribeToFinalizedEpoch() {
    return this.eventApi.eventstream("finalized_checkpoint");
  }
  public async getAttestationRewards(epoch: Epoch) {
    const attestationsResponse = await this.rewardApi.getAttestationsRewards(
      epoch,
      []
    );

    if (attestationsResponse.status === 200) {
      const attestations = attestationsResponse.data.data.total_rewards.filter(
        (at) =>
          Number(at.head) !== 0 ||
          Number(at.source) !== 0 ||
          Number(at.target) !== 0
      );
      //need for get attesters slot and time
      const attestationsDutiesData = await this.getAttestersDuties(
        epoch,
        attestations.map((attestation) => attestation.validator_index)
      );

      return attestations.map((at) => {
        if (attestationsDutiesData[at.validator_index]) {
          return {
            validatorIndex: Number(at.validator_index),
            inclusionDelay: Number(at.inclusion_delay),
            target: Number(at.target),
            source: Number(at.source),
            head: Number(at.head),
            time:
              attestationsDutiesData[at.validator_index].time ??
              this.getTime(epoch * 32),
            slot: attestationsDutiesData[at.validator_index].slot ?? epoch * 32,
            validatorAddress:
              attestationsDutiesData[at.validator_index].address ?? "",
          };
        } else {
          this.logger.error(
            `${at.validator_index}, was not found in duties "epoch", ${epoch}`
          );
          return {
            validatorIndex: Number(at.validator_index),
            inclusionDelay: Number(at.inclusion_delay),
            target: Number(at.target),
            source: Number(at.source),
            head: Number(at.head),
            time: this.getTime(epoch * 32),
            slot: epoch * 32,
            validatorAddress: "",
          };
        }
      });
    }
    return null;
  }

  public async getSyncCommitteeRewards(epoch: Epoch, slot: number) {
    if (epoch < ALTAIR_EPOCH) return null;
    try {
      const syncCommitteeRewards = await this.rewardApi.getSyncCommitteeRewards(
        slot
      );
      if (
        syncCommitteeRewards.status === 200 &&
        syncCommitteeRewards.data.data.length > 0
      ) {
        return syncCommitteeRewards.data.data.map((s) => ({
          validatorIndex: Number(s.validator_index),
          syncCommitteeReward: Number(s.reward),
        }));
      }
    } catch (e) {
      return null;
    }
  }
  public async getBlockProposerRewards(slot: Slot) {
    try {
      const rewardsResponse = await this.rewardApi.getBlockRewards(slot);
      if (rewardsResponse.status === 200) {
        const rewards = rewardsResponse.data.data;
        return {
          attestations: Number(rewards.attestations),
          proposerSlashingInclusion:
            Number(rewards.proposer_slashings) +
            Number(rewards.attester_slashings),
          syncAggregate: Number(rewards.sync_aggregate),
          proposerIndex: Number(rewards.proposer_index),
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
