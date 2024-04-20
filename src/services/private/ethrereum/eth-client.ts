import { AttestationReward, Epoch, ProposerReward, Slot, SyncCommitteeReward, Withdrawal } from '@/types';
import { BeaconApi, Configuration, RewardsApi, ValidatorApi } from './api';
import { createLoggingMoudule } from '@/utils';
import type { Logger } from 'winston';
import {
  ALTAIR_EPOCH,
  GWEI_TO_ETH,
  WHEI_TO_GWEI,
  rocketPoolSmoothingPoolAddress,
  staderSocializingPoolAddress
} from '@/constants';
import { ethers } from 'ethers';

import { BigNumber } from '@/utils/big-number';
import { assertIsNotNil } from '@/utils/assert';
import { BlockV2, parseEth2Block } from './parse-eth2-block';
import { not } from 'ramda';
import axios from 'axios';
import Decimal from 'decimal.js';

export class EthClient {
  private beaconApi: BeaconApi;
  private validatorApi: ValidatorApi;
  private rewardApi: RewardsApi;
  private elApi: ethers.JsonRpcApiProvider;
  private logger: Logger;
  constructor(configuration: Configuration, basePathEL: string) {
    this.logger = createLoggingMoudule('EthClient');
    this.beaconApi = new BeaconApi(configuration);
    this.validatorApi = new ValidatorApi(configuration);
    this.rewardApi = new RewardsApi(configuration);
    this.elApi = new ethers.JsonRpcProvider(basePathEL);
  }

  /*
   * *
   * *
   */
  private async getAttestersDuties(epoch: number, validatorIndices: Array<string>) {
    const attestationsDutiesData: Array<{
      validatorIndex: string;
      slot: number;
    }> = [];

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
          validatorIndices.slice(step, validatorIndices.length > endStep ? endStep : undefined),
          epoch
        )
      );
    }

    const attestationDutiesResponse = await Promise.all(requestArray);

    for (let r = 0; r < attestationDutiesResponse.length; r++) {
      const attestationsDuties = attestationDutiesResponse[r].data.data;

      for (let i = 0; i < attestationsDuties.length; i++) {
        const attestationDuty = attestationsDuties[i];
        attestationsDutiesData.push({
          validatorIndex: attestationDuty.validator_index,
          slot: Number(attestationDuty.slot)
        });
      }
    }
    return attestationsDutiesData;
  }

  /*
   * *
   * *
   */
  public async getFinalized() {
    try {
      const blockV2Raw = await this.beaconApi.getBlockV2('finalized');
      console.log(blockV2Raw.data.version);

      if (
        blockV2Raw.status === 200 &&
        (blockV2Raw.data.version === 'bellatrix' ||
          blockV2Raw.data.version === 'capella' ||
          blockV2Raw.data.version === 'deneb')
      ) {
        return parseEth2Block({
          slot: parseInt(blockV2Raw.data.data.message.slot),
          eth2BlockResponse: blockV2Raw.data
        });
      }
      return null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  /*
   * *
   * *
   */
  public async getLastFinalizedEpoch(): Promise<number> {
    return Number((await this.beaconApi.getStateFinalityCheckpoints('finalized')).data.data.finalized.epoch ?? 0);
  }

  /**
   * Returns the proposers duties for the given epoch.
   * @param epoch The epoch for which to retrieve the proposers duties.
   * @returns Array<[slot, validatorIndex]>
   */
  public async getProposersDuties(epoch: Epoch): Promise<Array<[number, number]>> {
    const proposerDutiesResponse = await this.validatorApi.getProposerDuties(epoch);
    if (proposerDutiesResponse.status === 200 && proposerDutiesResponse.data.data.length > 0) {
      return proposerDutiesResponse.data.data.map(v => [Number(v.slot), Number(v.validator_index)]);
    }
    return [];
  }

  /*
   * *
   * *
   */
  public async getAttestationRewards(epoch: Epoch): Promise<Array<AttestationReward>> {
    const attestationsResponse = await this.rewardApi.getAttestationsRewards(epoch, []);

    if (attestationsResponse.status === 200) {
      const attestations = attestationsResponse.data.data.total_rewards;
      const mappedAttestations: Record<
        string,
        {
          validator_index: string;
          head: string;
          target: string;
          source: string;
          inactivity: string;
          inclusion_delay: string;
        }
      > = {};
      //need for get attesters slot and time
      const attestationsDutiesData = await this.getAttestersDuties(
        epoch,
        attestations.map(attestation => {
          mappedAttestations[attestation.validator_index] = attestation;
          return attestation.validator_index;
        })
      );
      const attestationsResults: Array<AttestationReward> = [];
      attestationsDutiesData.forEach(duties => {
        if (mappedAttestations[duties.validatorIndex]) {
          const attesterRewars = mappedAttestations[duties.validatorIndex];
          attestationsResults.push({
            validatorIndex: Number(duties.validatorIndex),
            inclusionDelay: attesterRewars?.inclusion_delay ? Number(attesterRewars.inclusion_delay) : 0,
            target: Number(attesterRewars.target),
            source: Number(attesterRewars.source),
            head: Number(attesterRewars.head),
            attestationSlot: duties.slot,
            epoch
          });
        }
      });
      return attestationsResults;
    }
    return [];
  }

  /*
   * *
   * *
   */
  public async getSelectedAttestationRewards(
    epoch: Epoch,
    validatorIndices: string[]
  ): Promise<Array<AttestationReward>> {
    try {
      const [attestationsResponse, attestationsDuties] = await Promise.all([
        this.rewardApi.getAttestationsRewards(epoch, validatorIndices),
        this.getAttestersDuties(epoch, validatorIndices)
      ]);
      if (attestationsResponse.status === 200 && attestationsDuties.length) {
        const attestations = attestationsResponse.data.data.total_rewards as Array<{
          validator_index: string;
          head: string;
          target: string;
          source: string;
          inactivity: string;
          inclusion_delay?: string;
        }>;

        const mappedAttestations: Record<
          string,
          {
            validator_index: string;
            head: string;
            target: string;
            source: string;
            inactivity: string;
            inclusion_delay?: string;
          }
        > = {};

        attestations.map(attestation => {
          mappedAttestations[attestation.validator_index] = attestation;
          return attestation.validator_index;
        });
        const attestationsResults: Array<AttestationReward> = [];
        attestationsDuties.forEach(duties => {
          if (mappedAttestations[duties.validatorIndex]) {
            const attesterRewars = mappedAttestations[duties.validatorIndex];
            if (attesterRewars) {
              attestationsResults.push({
                validatorIndex: Number(duties.validatorIndex),
                inclusionDelay: attesterRewars?.inclusion_delay ? Number(attesterRewars.inclusion_delay) : 0,
                target: Number(attesterRewars.target),
                source: Number(attesterRewars.source),
                head: Number(attesterRewars.head),
                attestationSlot: Number(duties.slot),
                epoch
              });
            } else {
              attestationsResults.push({
                validatorIndex: Number(duties.validatorIndex),
                inclusionDelay: 0,
                target: 0,
                source: 0,
                head: 0,
                attestationSlot: Number(duties.slot),
                epoch
              });
            }
          }
        });
        return attestationsResults;
      }
      return [];
    } catch (e) {
      this.logger.error('Error in getSelectedAttestationRewards', e);
      return [];
    }
  }

  /*
   * *
   * *
   */
  public async getSyncCommitteeRewards(epoch: Epoch, slot: number): Promise<Array<SyncCommitteeReward> | null> {
    if (epoch < ALTAIR_EPOCH) return null;
    try {
      const syncCommitteeRewards = await this.rewardApi.getSyncCommitteeRewards(slot, []);
      console.log(syncCommitteeRewards.data.data, epoch, slot);
      if (syncCommitteeRewards.status === 200 && syncCommitteeRewards.data.data.length > 0) {
        return syncCommitteeRewards.data.data.map(s => ({
          syncCommitteeSlot: slot,
          validatorIndex: Number(s.validator_index),
          syncCommitteeReward: Number(s.reward),
          epoch
        }));
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /*
   * *
   * *
   */
  public async getSelectedSyncCommitteeRewards(
    epoch: Epoch,
    slotsPerEpoch: number = 32,
    validatorIndices: string[]
  ): Promise<Array<SyncCommitteeReward> | null> {
    if (epoch < ALTAIR_EPOCH) return null;
    try {
      let committeResults: Array<SyncCommitteeReward> = [];
      const syncCommitteeDuties = await this.validatorApi.getSyncCommitteeDuties(validatorIndices, epoch);
      if (syncCommitteeDuties.data.data.length > 0) {
        const startSlot = epoch * slotsPerEpoch;
        const endSlot = startSlot + slotsPerEpoch - 1;

        for (let slotNumber = startSlot; slotNumber <= endSlot; slotNumber++) {
          try {
            const syncCommitteeRewardsResponse = await this.rewardApi.getSyncCommitteeRewards(
              slotNumber,
              validatorIndices
            );
            if (syncCommitteeRewardsResponse.status === 200 && syncCommitteeRewardsResponse.data.data.length > 0) {
              const syncCommitteeRewards = syncCommitteeRewardsResponse.data.data;

              committeResults = committeResults.concat(
                syncCommitteeRewards.map(s => ({
                  syncCommitteeSlot: slotNumber,
                  validatorIndex: Number(s.validator_index),
                  syncCommitteeReward: Number(s.reward),
                  epoch
                }))
              );
            }
          } catch (e) {
            continue;
          }
        }
      }
      return committeResults;
    } catch (e) {
      console.log('syncCommitteeRewards error ', e);
      return null;
    }
  }

  /*
   * *
   * *
   */
  public async getBlockProposerRewards(epoch: Epoch, slot: Slot): Promise<ProposerReward | null> {
    try {
      const [rewardsResponse, blockV2] = await Promise.all([
        this.rewardApi.getBlockRewards(slot),
        this.getBlockV2(slot)
      ]);

      let exReward: null | string = null;
      if (blockV2) {
        const block = await this.getBlockV1(blockV2.eth2BlockNumber);
        if (block) {
          exReward = await this.getELBlockReward(block, blockV2.eth2BlockBody.execution_payload.fee_recipient);
        }
      }

      if (rewardsResponse.status === 200) {
        const rewards = rewardsResponse.data.data;

        return {
          proposerSlot: slot,
          attestationsInclusion: Number(rewards.attestations),
          slashingInclusion: Number(rewards.proposer_slashings) + Number(rewards.attester_slashings),
          syncAggregateInclusion: Number(rewards.sync_aggregate),
          proposalMissed: 0,
          validatorIndex: Number(rewards.proposer_index),
          exReward,
          epoch
        };
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  }

  async getBlockV1(blockNumber: number): Promise<ethers.Block | null> {
    return await this.elApi.getBlock(blockNumber);
  }

  async getBlockV2(slot: Slot) {
    try {
      const blockV2Raw = await this.beaconApi.getBlockV2(slot);
      if (
        blockV2Raw.status === 200 &&
        (blockV2Raw.data.version === 'bellatrix' ||
          blockV2Raw.data.version === 'capella' ||
          blockV2Raw.data.version === 'deneb')
      ) {
        return parseEth2Block({ slot, eth2BlockResponse: blockV2Raw.data });
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  public async getWithdrawalsBySlot(slot: number) {
    const blockV2 = await this.getBlockV2(slot);
    if (blockV2) {
      return this.getWithdrawals(blockV2);
    }
    return null;
  }

  getWithdrawals(blockV2: BlockV2): Array<Withdrawal> | null {
    if (blockV2.withdrawals.length === 0) return null;
    return blockV2.withdrawals.map(w => ({
      slot: blockV2.eth2Slot,
      blockNumber: blockV2.eth2BlockNumber,
      validatorIndex: Number(w.validator_index),
      withdrawalId: Number(w.index),
      address: w.address,
      amount: new BigNumber(w.amount).toNumber()
    }));
  }

  async getELBlockReward(block: ethers.Block, eth2FeeRecepient: string) {
    const [receiptsRaw, network] = await Promise.all([
      this.elApi.send('eth_getBlockReceipts', ['0x' + block.number.toString(16)]) as Promise<Array<any>>,
      this.elApi.getNetwork()
    ]);

    if (receiptsRaw === null) return null;

    const receipts = receiptsRaw.map(receipt => this.elApi._wrapTransactionReceipt(receipt, network));

    if (receipts.length) {
      let isMevReward = false;
      let hasMark = false;
      const latestReceipt = receipts[receipts.length - 1]!;
      assertIsNotNil(latestReceipt, { message: 'RECEIPT_NOT_FOUND' });

      isMevReward = latestReceipt.from.toLowerCase() === eth2FeeRecepient;

      if (not(isMevReward)) {
        const responseRaw = await axios.get(
          `https://relay.ultrasound.money/relay/v1/data/bidtraces/proposer_payload_delivered?block_hash=${block.hash}`
        );
        responseRaw.data as Array<any>;
        if (responseRaw.data.length > 0) isMevReward = true;
      }

      if (eth2FeeRecepient === staderSocializingPoolAddress || eth2FeeRecepient === rocketPoolSmoothingPoolAddress)
        hasMark = true;

      if (not(isMevReward) && not(hasMark)) {
        const transactionFeeAmounts = receipts.map(receipt => {
          return new Decimal(receipt.gasPrice.toString()).mul(receipt.gasUsed.toString());
        });
        const totalFeeAmount = transactionFeeAmounts.reduce((a, b) => a.add(b), new Decimal(0));
        const burntFeeAmount = new Decimal(block.baseFeePerGas?.toString() ?? 0).mul(block.gasUsed.toString());

        return totalFeeAmount.sub(burntFeeAmount).toString();
      }
    }
    return null;
  }
  public async getSelectedBlockProposerRewards(
    epoch: Epoch,
    validatorIndices: string[]
  ): Promise<{
    proposersResults: Array<ProposerReward> | null;
    slotPerEpoch: number;
  }> {
    const proposerDuties = await this.getProposersDuties(epoch);
    const proposersResults = [];
    for (let p = 0; p < proposerDuties.length; p++) {
      const [slot, proposerIndex] = proposerDuties[p];
      for (let i = 0; i < validatorIndices.length; i++) {
        if (proposerIndex === Number(validatorIndices[i])) {
          this.logger.debug(`found proposer  vlaidator ${proposerIndex} slot ${slot} epoch ${epoch}`);
          const proposerRewards = await this.getBlockProposerRewards(epoch, slot as number);
          if (proposerRewards) {
            proposersResults.push(proposerRewards);
          } else {
            proposersResults.push({
              validatorIndex: Number(proposerIndex),
              proposerSlot: slot as number,
              proposalMissed: 1,
              attestationsInclusion: 0,
              slashingInclusion: 0,
              syncAggregateInclusion: 0,
              epoch,
              exReward: null
            });
          }
        }
      }
    }
    return { proposersResults, slotPerEpoch: proposerDuties?.length ?? 0 };
  }

  public async getValidatorStatus(validatorIndex: string | number) {
    const res = (await this.beaconApi.getStateValidator('finalized', validatorIndex)).data.data.validator;

    // if (res.slashed) return null;
    return {
      activationEpoch: new BigNumber(res.activation_epoch),
      exitEpoch: new BigNumber(res.exit_epoch)
    };
  }
}
