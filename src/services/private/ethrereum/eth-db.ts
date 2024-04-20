import { AttestationRewardsModel } from '@/models/attestation-rewards';
import { ProposerRewardsModel } from '@/models/proposer-rewards';
import { SyncCommitteeRewardsModel } from '@/models/sync-committee-rewards';
import { AttestationReward, ProposerReward, SyncCommitteeReward } from '@/types';
import { dbClients, exec } from '@/services/shared/database';
import DateTime from 'moment';
import pricsesCap from '@/../prices.json';
import { Networks } from '@/config/networks';

export class EthDBService {
  private networkName: Networks;

  constructor(networkName: Networks) {
    this.networkName = networkName;
  }

  async readSlotsWithPirceIsNull(table: string) {
    return (
      await exec(
        `SELECT slot, id, price, price_eur FROM ${table} WHERE price IS NULL OR price_eur IS NULL`,
        [],
        dbClients.local
      )
    ).rows as Array<{
      slot: number;
      id: number;
      price: number | null;
      price_eur: number | null;
    }>;
  }

  async readWithdrawals(validatorIndex: string | number, startSlot: number, endSlot: number) {
    const { rows: withdrawals } = await exec<{
      index: number;
      slot: number;
      block_number: number;
      amount: number;
      address: number;
    }>(
      `SELECT w.withdrawal_index as index, w.slot, w.block_number,w.amount, w.address FROM withdrawals_${this.networkName} w
     WHERE validator_index= $1  AND w.slot >= $2 AND w.slot <= $3
     ORDER BY withdrawal_index ASC;`,
      [validatorIndex, startSlot, endSlot],
      dbClients.local
    );
    return withdrawals;
  }
  async updateSlotPrice(
    table: string,
    slotData: { id: number; price: number | null; price_eur: number | null },
    prices: Partial<{ price: number; price_eur: number }>
  ) {
    if (prices.price && prices.price_eur) {
      await exec(
        `UPDATE ${table} SET price=$1, price_eur=$2 WHERE id=$3`,
        [Number(prices.price.toFixed(2)), Number(prices.price_eur.toFixed(2)), slotData.id],
        dbClients.local
      );
    }
  }

  async readRewardsDetailsData(validatorIndex: string | number, startSlot: number, endSlot: number) {
    const { rows: rewards } = await exec<{
      table: 'attestation' | 'sync committee' | 'propose';
      epoch: number;
      slot: number | null;
      price: number;
      price_eur: number;
      total: number;
    }>(
      `SELECT DISTINCT        
            'attestation'                     as table,
             at.epoch                          as epoch,      
             at.slot                           as slot,

             (COALESCE(at.source::INTEGER, 0) +
             COALESCE(at.target::INTEGER,0)   +
             COALESCE(at.head::INTEGER,0))     as total,
       
             at.price                          as price,
             at.price_eur                      as price_eur
 
     FROM attestation_rewards_${this.networkName} at 
     WHERE at.validator_index = $1 AND at.slot > 5475598
     
     UNION  
     
     SELECT DISTINCT 
            'propose'                         as table,
            pr.epoch                           as epoch,
            pr.slot                            as slot,
              
            (COALESCE(pr.slashing_inclusion_reward, 0)  +
            COALESCE(pr.attestation_inclusion_reward,0) +
            COALESCE(pr.sync_inclusion_reward,0)) as total,
    
            pr.price                           as price,
            pr.price_eur                       as price_eur

     FROM   proposer_rewards_${this.networkName} pr
     WHERE  pr.validator_index = $1 AND pr.slot > 5475598
     
     UNION
     
     SELECT DISTINCT 
            'sync committee'                             as table,
            sc.epoch                           as epoch,
            sc.slot                            as slot,
            sc.sync_committee_reward           as total,
      
            sc.price                           as price,
            sc.price_eur                       as price_eur
     FROM  sync_committee_rewards_${this.networkName} sc
     WHERE  sc.validator_index = $1 AND sc.slot > $2::INTEGER AND sc.slot < $3::INTEGER
     ORDER BY slot ASC`,
      [validatorIndex, startSlot, endSlot],
      dbClients.local
    );
    return rewards;
  }
  async writeEpochRewards(epochRewards: {
    attestationsRewards: Array<AttestationReward>;
    proposersRewards: Array<ProposerReward>;
    syncCommitteeRewards: Array<SyncCommitteeReward>;
  }) {
    const { attestationsRewards, proposersRewards, syncCommitteeRewards } = epochRewards;
    const attestationsRewardsModel = new AttestationRewardsModel({
      network_name: this.networkName
    });
    const proposerRewardsModel = new ProposerRewardsModel({
      network_name: this.networkName
    });
    const syncCommitteeRewardsModel = new SyncCommitteeRewardsModel({
      network_name: this.networkName
    });

    for (let attestationIndex = 0; attestationIndex < attestationsRewards.length; attestationIndex++) {
      await attestationsRewardsModel.directInsert(attestationsRewards[attestationIndex]);
    }
    for (let proposerIndex = 0; proposerIndex < proposersRewards.length; proposerIndex++) {
      await proposerRewardsModel.directInsert(proposersRewards[proposerIndex]);
    }
    for (let syncCommitteeIndex = 0; syncCommitteeIndex < syncCommitteeRewards.length; syncCommitteeIndex++) {
      await syncCommitteeRewardsModel.directInsert(syncCommitteeRewards[syncCommitteeIndex]);
    }
  }

  async writeMissedEpoch(id: number, validatorIndices: Array<string>, is_all_validators: boolean = false) {
    await exec(
      `INSERT INTO missed_epochs (network_name, epoch, validator_indices, is_all_validators)
      VALUES ($1, $2, $3, $4)`,
      [this.networkName, id, validatorIndices, is_all_validators],
      dbClients.local
    );
  }

  async readMissedEpochs() {
    return (
      await exec<{
        id: number;
        epoch: number;
        validator_indices: Array<number>;
        is_all_validators: boolean;
      }>('SELECT id,epoch, validator_indices, is_all_validators FROM missed_epochs WHERE network_name=$1', [
        this.networkName
      ])
    ).rows;
  }
  async deleteMissedEpoch(id: number) {
    await exec('DELETE FROM missed_epochs WHERE id=$1', [id], dbClients.local);
  }
  async readSummaryTabelData(validatorIndex: string | number, startSlot: number, endSlot: number) {
    return (
      await exec<{
        total: string;
        slot: number;
        epoch: number;
        attestation_price: number;
        attestation_price_eur: number;
        proposer_price: number;
        proposer_price_eur: number;
        sync_committee_price: number;
        sync_committee_price_eur: number;
      }>(
        `SELECT DISTINCT at.epoch     as epoch,
                       at.slot      as slot,
                       at.price     as attestation_price,
                       at.price_eur as attestation_price_eur,
                       pr.price     as proposer_price,
                       pr.price_eur as proposer_price_eur,
                       sc.price     as sync_committee_price,
                       sc.price_eur as sync_committee_price_eur,
                       (COALESCE(at.source::INTEGER, 0) +
                       COALESCE(at.target::INTEGER,0)   +
                       COALESCE(at.head::INTEGER,0)     +
                       COALESCE(pr.slashing_inclusion_reward::INTEGER, 0)  +
                       (COALESCE(pr.ex_reward::NUMERIC, 0) * power(10,-9)) +
                       COALESCE(pr.attestation_inclusion_reward::INTEGER,0) +
                       COALESCE(pr.sync_inclusion_reward::INTEGER,0) + 
                       COALESCE(sc.sync_committee_reward::INTEGER,0))  as total

              FROM attestation_rewards_${this.networkName} at 
                  LEFT JOIN proposer_rewards_${this.networkName} pr ON pr.epoch =at.epoch::INTEGER AND
                    pr.validator_index = at.validator_index::INTEGER
                  LEFT JOIN sync_committee_rewards_${this.networkName} sc ON sc.epoch =at.epoch::INTEGER AND
                    sc.validator_index = at.validator_index::INTEGER
              WHERE at.validator_index = $1::INTEGER AND at.slot > $2::INTEGER  AND at.slot <$3::INTEGER
              ORDER BY at.epoch ASC`,
        [validatorIndex, startSlot, endSlot]
      )
    ).rows;
  }

  async readPrice(
    currencyId: string,
    time: DateTime.Moment
  ): Promise<Partial<{ price: number; price_eur: number }> | null> {
    // min date:
    // new Date(1606686422000)
    // Mon Nov 30 2020 01:47:02 GMT+0400 (Gulf Standard Time)

    // max date:
    // new Date(1697829960000)
    // Fri Oct 20 2023 23:26:00 GMT+0400 (Gulf Standard Time)

    // prices_new:
    // min date:
    // new Date(1697225280000)
    // Fri Oct 13 2023 23:28:00 GMT+0400 (Gulf Standard Time)

    // new Date(1711967580000)
    // Mon Apr 01 2024 14:33:00 GMT+0400 (Gulf Standard Time)

    const borderDate = DateTime.unix(1697124480);
    //Date and time (GMT): Thursday, 12 October 2023 г., 15:28:00

    const quote = pricsesCap.data.ETH[0].quotes.find(p => DateTime.utc(p.timestamp).isSame(time, 'day'))?.quote;
    // const tabel = time.isBefore(borderDate) ? 'prices' : 'prices_new';
    // const result = await exec<{ price: number; price_eur: number }>(
    //   `SELECT price, price_eur
    //   FROM ${tabel}
    //   WHERE currency = $1::TEXT
    //     AND date < $2::BIGINT
    //   ORDER BY date DESC
    //   LIMIT 1;`,
    //   [currencyId, time.unix()],
    //   dbClients.allnodes
    // );
    // return result.rows.pop() || null;
    return { price: quote?.USD.price, price_eur: quote?.EUR.price };
  }
}
