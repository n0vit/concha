import { Record } from '../services/shared/orm';
import { AttestationReward } from '@/types';

export class AttestationRewardsModel extends Record {
  target: number;
  source: number;
  head: number;
  finality_delay_penalty: number;
  epoch: number;
  validator_index: number;
  slot: number;

  constructor(
    obj: Partial<AttestationRewardsModel> & {
      network_name: 'mainnet' | 'holesky';
    } = {
      network_name: 'mainnet'
    }
  ) {
    super(obj, `attestation_rewards_${obj.network_name}`);
    this.slot = obj.slot || 0;
    this.head = obj.head || 0;
    this.target = obj.target || 0;
    this.source = obj.source || 0;
    this.finality_delay_penalty = obj.finality_delay_penalty || 0;
    this.epoch = obj.epoch || 0;
    this.validator_index = obj.validator_index || 0;
  }

  async directInsert(data: AttestationReward): Promise<any> {
    return await super.directInsert({
      epoch: data.epoch,
      slot: data.attestationSlot,
      validator_index: data.validatorIndex,
      target: data.target,
      head: data.head,
      source: data.source,
      finality_delay_penalty: data.inclusionDelay
    });
  }
  toAPI(): AttestationReward {
    return {
      validatorIndex: this.validator_index ?? 0,
      inclusionDelay: this.finality_delay_penalty ?? 0,
      target: this.target ?? 0,
      source: this.source ?? 0,
      head: this.head ?? 0,
      attestationSlot: this.slot ?? 0,
      epoch: this.epoch ?? 0
    };
  }
}
