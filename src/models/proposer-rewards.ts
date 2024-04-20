import { Record } from '../services/shared/orm';
import { ProposerReward } from '@/types';

export class ProposerRewardsModel extends Record {
  epoch: number;
  validator_index: number;
  slot: number;
  proposals_missed: number;
  attestation_inclusion_reward: number;
  slashing_inclusion_reward: number;
  sync_inclusion_reward: number;
  ex_reward: string | null;

  constructor(
    obj: Partial<ProposerRewardsModel> & {
      network_name: 'mainnet' | 'holesky';
    } = {
      network_name: 'mainnet'
    }
  ) {
    super(obj, `proposer_rewards_${obj.network_name}`);
    this.slot = obj.slot || 0;
    this.epoch = obj.epoch || 0;
    this.validator_index = obj.validator_index || 0;
    this.proposals_missed = obj.proposals_missed || 0;
    this.slashing_inclusion_reward = obj.slashing_inclusion_reward || 0;
    this.sync_inclusion_reward = obj.sync_inclusion_reward || 0;
    this.attestation_inclusion_reward = obj.attestation_inclusion_reward || 0;
    this.ex_reward = obj.ex_reward || null;
  }

  async directInsert(data: ProposerReward): Promise<any> {
    return await super.directInsert({
      epoch: data.epoch,
      slot: data.proposerSlot,
      validator_index: data.validatorIndex,
      slashing_inclusion_reward: data.slashingInclusion,
      sync_inclusion_reward: data.syncAggregateInclusion,
      attestation_inclusion_reward: data.attestationsInclusion,
      proposals_missed: data.proposalMissed,
      ex_reward: data.exReward
    });
  }
  toAPI(): ProposerReward {
    return {
      validatorIndex: this.validator_index ?? 0,
      proposalMissed: this.proposals_missed ?? 0,
      proposerSlot: this.slot ?? 0,
      attestationsInclusion: this.attestation_inclusion_reward ?? 0,
      slashingInclusion: this.slashing_inclusion_reward ?? 0,
      syncAggregateInclusion: this.sync_inclusion_reward ?? 0,
      epoch: this.epoch ?? 0,
      exReward: null
    };
  }
}
