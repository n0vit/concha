import { SyncCommitteeReward } from '@/types';
import { Record } from '../services/shared/orm';

export class SyncCommitteeRewardsModel extends Record {
  epoch: number;
  slot: number | null;
  sync_committee_reward: number;
  validator_index: number;

  constructor(
    obj: Partial<SyncCommitteeRewardsModel> & {
      network_name: 'mainnet' | 'holesky';
    } = {
      network_name: 'mainnet'
    }
  ) {
    super(obj, `sync_committee_rewards_${obj.network_name}`);
    this.slot = obj.slot || 0;
    this.epoch = obj.epoch || 0;
    this.sync_committee_reward = obj.sync_committee_reward || 0;
    this.validator_index = obj.validator_index || 0;
  }

  async directInsert(data: SyncCommitteeReward): Promise<any> {
    return await super.directInsert({
      epoch: data.epoch,
      slot: data.syncCommitteeSlot,
      validator_index: data.validatorIndex,
      sync_committee_reward: data.syncCommitteeReward
    });
  }
  toAPI(): SyncCommitteeReward {
    return {
      syncCommitteeSlot: this.slot ?? 0,
      syncCommitteeReward: this.sync_committee_reward ?? 0,
      epoch: this.epoch ?? 0,
      validatorIndex: this.validator_index ?? 0
    };
  }
}
