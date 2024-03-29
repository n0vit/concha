import { ValidatorRewardsBase } from "@/entites/validator-rewards";
import { Record } from "../services/record";

export class ValidatorRewardsModel extends Record {
  attestation_source_reward: number | null;
  attestation_source_penalty: number | null;
  attestation_target_reward: number | null;
  attestation_target_penalty: number | null;
  attestation_head_reward: number | null;
  attestation_slot: number | null;
  finality_delay_penalty: number | null;
  proposer_slashing_inclusion_reward: number | null;
  proposer_attestation_inclusion_reward: number | null;
  proposer_sync_inclusion_reward: number | null;
  sync_committee_reward: number | null;
  sync_committee_penalty: number | null;
  proposals_missed: number | null;
  timestamp: string | null;
  total_reward_amount: number | null;
  epoch: number | null;
  validator_index: number | null;
  validator_address: string | null;
  network_name: "mainnet" | "holesky" | null;

  constructor(obj: Partial<ValidatorRewardsModel> = {}) {
    super(obj, "validator_rewards");
    this.attestation_head_reward = obj.attestation_head_reward || null;
    this.attestation_source_reward = obj.attestation_source_reward || null;
    this.attestation_source_penalty = obj.attestation_source_penalty || null;
    this.attestation_target_reward = obj.attestation_target_reward || null;
    this.attestation_target_penalty = obj.attestation_target_penalty || null;
    this.attestation_slot = obj.attestation_slot || null;
    this.finality_delay_penalty = obj.finality_delay_penalty || null;

    this.proposer_slashing_inclusion_reward =
      obj.proposer_slashing_inclusion_reward || null;
    this.proposer_attestation_inclusion_reward =
      obj.proposer_attestation_inclusion_reward || null;
    this.proposer_sync_inclusion_reward =
      obj.proposer_sync_inclusion_reward || null;
    this.proposals_missed = obj.proposals_missed || null;

    this.sync_committee_reward = obj.sync_committee_reward || null;
    this.sync_committee_penalty = obj.sync_committee_penalty || null;

    this.timestamp = obj.timestamp || null;
    this.total_reward_amount = obj.total_reward_amount || null;
    this.epoch = obj.epoch || null;
    this.validator_address = obj.validator_address || null;
    this.validator_index = obj.validator_index || null;
    this.network_name = obj.network_name || null;
  }

  fromAPI(
    validatorRewards: ValidatorRewardsBase,
    validatorIndex: number,
    network: "mainnet" | "holesky"
  ) {
    this.set(
      "attestation_head_reward",
      validatorRewards.attestationHeadReward === 0
        ? null
        : validatorRewards.attestationHeadReward
    );
    this.set(
      "attestation_source_reward",
      validatorRewards.attestationSourceReward === 0
        ? null
        : validatorRewards.attestationSourceReward
    );
    this.set(
      "attestation_source_penalty",
      validatorRewards.attestationSourcePenalty === 0
        ? null
        : validatorRewards.attestationSourcePenalty
    );
    this.set(
      "attestation_target_reward",
      validatorRewards.attestationTargetReward === 0
        ? null
        : validatorRewards.attestationTargetReward
    );
    this.set(
      "attestation_target_penalty",
      validatorRewards.attestationTargetPenalty === 0
        ? null
        : validatorRewards.attestationTargetPenalty
    );
    this.set(
      "attestation_slot",
      validatorRewards.attestationSlot === 0
        ? null
        : validatorRewards.attestationTargetPenalty
    );
    this.set(
      "finality_delay_penalty",
      validatorRewards.finalityDelayPenalty === 0
        ? null
        : validatorRewards.finalityDelayPenalty
    );

    this.set(
      "proposer_slashing_inclusion_reward",
      validatorRewards.proposerSlashingInclusionReward === 0
        ? null
        : validatorRewards.proposerSlashingInclusionReward
    );
    this.set(
      "proposer_attestation_inclusion_reward",
      validatorRewards.proposerAttestationInclusionReward === 0
        ? null
        : validatorRewards.proposerAttestationInclusionReward
    );
    this.set(
      "proposer_sync_inclusion_reward",
      validatorRewards.proposerSyncInclusionReward === 0
        ? null
        : validatorRewards.proposerSyncInclusionReward
    );
    this.set(
      "proposals_missed",
      validatorRewards.proposalsMissed === 0
        ? null
        : validatorRewards.proposalsMissed
    );

    this.set(
      "sync_committee_reward",
      validatorRewards.syncCommitteeReward === 0
        ? null
        : validatorRewards.syncCommitteeReward
    );
    this.set(
      "sync_committee_penalty",
      validatorRewards.syncCommitteePenalty === 0
        ? null
        : validatorRewards.syncCommitteePenalty
    );

    this.set("timestamp", validatorRewards.timestamp || null);
    this.set("total_reward_amount", validatorRewards.total || null);
    this.set("epoch", validatorRewards.epoch);
    this.set("validator_index", validatorIndex || null);
    this.set("network_name", network);
  }

  toAPI(): ValidatorRewardsBase {
    return new ValidatorRewardsBase({
      epoch: this.epoch ?? 0,
      attestationHeadReward: this.attestation_head_reward ?? 0,
      attestationSourceReward: this.attestation_source_reward ?? 0,
      attestationSourcePenalty: this.attestation_source_penalty ?? 0,
      attestationTargetReward: this.attestation_target_reward ?? 0,
      attestationTargetPenalty: this.attestation_target_penalty ?? 0,
      attestationSlot: this.attestation_slot ?? 0,
      finalityDelayPenalty: this.finality_delay_penalty ?? 0,
      proposerSlashingInclusionReward:
        this.proposer_slashing_inclusion_reward ?? 0,
      proposerAttestationInclusionReward:
        this.proposer_attestation_inclusion_reward ?? 0,
      proposerSyncInclusionReward: this.proposer_sync_inclusion_reward ?? 0,
      syncCommitteeReward: this.sync_committee_reward ?? 0,
      syncCommitteePenalty: this.sync_committee_penalty ?? 0,
      proposalsMissed: this.proposals_missed ?? 0,
      timestamp: this.timestamp ?? "",
      total: this.total_reward_amount ?? 0,
      validatorAddress: this.validator_address ?? "",
    });
  }
}
