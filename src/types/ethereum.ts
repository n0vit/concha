import { Networks } from '@/config/networks';

/**
 * when validator initiates voluntary exit, it gets exit and withdrawable epochs, so next status is exited_unslashed or exited_slashed
 * next state will be withdrawal_possible or withdrawal_done
 */
export type TekuValidatorStatus =
  | 'pending_initialized'
  | 'pending_queued'
  | 'active_ongoing'
  | 'active_exiting' // exit epoch will be in future
  | 'active_slashed'
  | 'exited_unslashed' // exit epoch now or in the past, but withdrawable epoch will be in future
  | 'exited_slashed' // exit epoch now or in the past, but withdrawable epoch will be in future
  | 'withdrawal_possible' // withdrawable epoch now or in the past, but effective balance still greater than 0
  | 'withdrawal_done'; // withdrawable epoch now or in the past, effective balance equals 0

/**
 *
 */
export interface TekuValidator {
  index: string;
  balance: string;
  status: TekuValidatorStatus;
  validator: {
    pubkey: string;
    withdrawal_credentials: string;
    effective_balance: string;
    slashed: boolean;
    activation_eligibility_epoch: string;
    activation_epoch: string;
    exit_epoch: string;
    withdrawable_epoch: string;
  };
}

/**
 *
 */
export interface TekuCheckpoints {
  previous_justified: {
    epoch: string;
    root: string;
  };
  current_justified: {
    epoch: string;
    root: string;
  };
  finalized: {
    epoch: string;
    root: string;
  };
}

/**
 *
 */
export interface TekuBellatrixBlockResponse {
  version: 'bellatrix';
  execution_optimistic: boolean;
  data: {
    message: {
      slot: string;
      proposer_index: string;
      parent_root: string;
      state_root: string;
      body: {
        randao_reveal: string;
        eth1_data: {
          deposit_root: string;
          deposit_count: string;
          block_hash: string;
        };
        graffiti: string;
        proposer_slashings: unknown[];
        attester_slashings: unknown[];
        attestations: unknown[];
        deposits: unknown[];
        voluntary_exits: unknown[];
        sync_aggregate: {
          sync_committee_bits: string;
          sync_committee_signature: string;
        };
        execution_payload: {
          parent_hash: string;
          fee_recipient: string;
          state_root: string;
          receipts_root: string;
          logs_bloom: string;
          prev_randao: string;
          block_number: string;
          gas_limit: string;
          gas_used: string;
          timestamp: string;
          extra_data: string;
          base_fee_per_gas: string;
          block_hash: string;
          transactions: string[];
          withdrawals?: undefined;
        };
      };
    };
    signature: string;
  };
}

/**
 *
 */
export interface TekuCapellaBlockResponse {
  version: 'capella';
  execution_optimistic: boolean;
  finalized: boolean;
  data: {
    message: {
      slot: string;
      proposer_index: string;
      parent_root: string;
      state_root: string;
      body: {
        randao_reveal: string;
        eth1_data: {
          deposit_root: string;
          deposit_count: string;
          block_hash: string;
        };
        graffiti: string;
        proposer_slashings: unknown[];
        attester_slashings: unknown[];
        bls_to_execution_changes: unknown[];
        attestations: unknown[];
        deposits: unknown[];
        voluntary_exits: unknown[];
        sync_aggregate: {
          sync_committee_bits: string;
          sync_committee_signature: string;
        };
        execution_payload: {
          parent_hash: string;
          fee_recipient: string;
          state_root: string;
          receipts_root: string;
          logs_bloom: string;
          prev_randao: string;
          block_number: string;
          gas_limit: string;
          gas_used: string;
          timestamp: string;
          extra_data: string;
          base_fee_per_gas: string;
          block_hash: string;
          transactions: string[];
          withdrawals: Array<{
            index: string;
            validator_index: string;
            address: string;
            amount: string;
          }>;
        };
      };
    };
    signature: string;
  };
}

/**
 *
 */
export interface TekuDenebBlockResponse {
  version: 'deneb';
  execution_optimistic: boolean;
  finalized: boolean;
  data: {
    message: {
      slot: string;
      proposer_index: string;
      parent_root: string;
      state_root: string;
      body: {
        randao_reveal: string;
        eth1_data: {
          deposit_root: string;
          deposit_count: string;
          block_hash: string;
        };
        graffiti: string;
        proposer_slashings: unknown[];
        attester_slashings: unknown[];
        attestations: unknown[];
        deposits: unknown[];
        voluntary_exits: unknown[];
        sync_aggregate: {
          sync_committee_bits: string;
          sync_committee_signature: string;
        };
        execution_payload: {
          parent_hash: string;
          fee_recipient: string;
          state_root: string;
          receipts_root: string;
          logs_bloom: string;
          prev_randao: string;
          block_number: string;
          gas_limit: string;
          gas_used: string;
          timestamp: string;
          extra_data: string;
          base_fee_per_gas: string;
          block_hash: string;
          transactions: string[];
          withdrawals: Array<{
            index: string;
            validator_index: string;
            address: string;
            amount: string;
          }>;
          blob_gas_used: string;
          excess_blob_gas: string;
        };
        bls_to_execution_changes: unknown[];
        blob_kzg_commitments: string[];
      };
    };
    signature: string;
  };
}

/**
 *
 */
export type TekuBlockResponse = TekuBellatrixBlockResponse | TekuCapellaBlockResponse | TekuDenebBlockResponse;

/**
 *
 */
export interface TekuSpecConfig {
  SLOTS_PER_EPOCH: string;
  PRESET_BASE: string;
  TERMINAL_TOTAL_DIFFICULTY: string;
  INACTIVITY_SCORE_BIAS: string;
  MAX_ATTESTER_SLASHINGS: string;
  MAX_WITHDRAWALS_PER_PAYLOAD: string;
  INACTIVITY_PENALTY_QUOTIENT_BELLATRIX: string;
  INACTIVITY_PENALTY_QUOTIENT: string;
  SAFE_SLOTS_TO_UPDATE_JUSTIFIED: string;
  SECONDS_PER_ETH1_BLOCK: string;
  MIN_SEED_LOOKAHEAD: string;
  VALIDATOR_REGISTRY_LIMIT: string;
  SLOTS_PER_HISTORICAL_ROOT: string;
  DOMAIN_VOLUNTARY_EXIT: string;
  MAX_VALIDATORS_PER_COMMITTEE: string;
  MIN_GENESIS_TIME: string;
  ALTAIR_FORK_EPOCH: string;
  HYSTERESIS_QUOTIENT: string;
  ALTAIR_FORK_VERSION: string;
  MAX_BYTES_PER_TRANSACTION: string;
  WHISTLEBLOWER_REWARD_QUOTIENT: string;
  PROPOSER_REWARD_QUOTIENT: string;
  MAX_VALIDATORS_PER_WITHDRAWALS_SWEEP: string;
  EPOCHS_PER_HISTORICAL_VECTOR: string;
  MIN_PER_EPOCH_CHURN_LIMIT: string;
  TARGET_AGGREGATORS_PER_SYNC_SUBCOMMITTEE: string;
  MAX_DEPOSITS: string;
  BELLATRIX_FORK_EPOCH: string;
  TARGET_AGGREGATORS_PER_COMMITTEE: string;
  DOMAIN_SYNC_COMMITTEE_SELECTION_PROOF: string;
  EPOCHS_PER_SLASHINGS_VECTOR: string;
  MIN_SLASHING_PENALTY_QUOTIENT: string;
  MAX_BLS_TO_EXECUTION_CHANGES: string;
  DOMAIN_BEACON_ATTESTER: string;
  GENESIS_DELAY: string;
  MAX_SEED_LOOKAHEAD: string;
  ETH1_FOLLOW_DISTANCE: string;
  SECONDS_PER_SLOT: string;
  MIN_SYNC_COMMITTEE_PARTICIPANTS: string;
  BELLATRIX_FORK_VERSION: string;
  PROPORTIONAL_SLASHING_MULTIPLIER_BELLATRIX: string;
  EFFECTIVE_BALANCE_INCREMENT: string;
  FIELD_ELEMENTS_PER_BLOB: string;
  MIN_EPOCHS_TO_INACTIVITY_PENALTY: string;
  BASE_REWARD_FACTOR: string;
  MAX_EXTRA_DATA_BYTES: string;
  CONFIG_NAME: string;
  MAX_PROPOSER_SLASHINGS: string;
  INACTIVITY_SCORE_RECOVERY_RATE: string;
  MAX_TRANSACTIONS_PER_PAYLOAD: string;
  DEPOSIT_CONTRACT_ADDRESS: string;
  MIN_ATTESTATION_INCLUSION_DELAY: string;
  SHUFFLE_ROUND_COUNT: string;
  TERMINAL_BLOCK_HASH_ACTIVATION_EPOCH: string;
  MAX_EFFECTIVE_BALANCE: string;
  DOMAIN_BEACON_PROPOSER: string;
  DOMAIN_SYNC_COMMITTEE: string;
  PROPOSER_SCORE_BOOST: string;
  DOMAIN_SELECTION_PROOF: string;
  MIN_SLASHING_PENALTY_QUOTIENT_BELLATRIX: string;
  HYSTERESIS_UPWARD_MULTIPLIER: string;
  MIN_DEPOSIT_AMOUNT: string;
  PROPORTIONAL_SLASHING_MULTIPLIER_ALTAIR: string;
  MAX_BLOBS_PER_BLOCK: string;
  MIN_VALIDATOR_WITHDRAWABILITY_DELAY: string;
  TARGET_COMMITTEE_SIZE: string;
  TERMINAL_BLOCK_HASH: string;
  RANDOM_SUBNETS_PER_VALIDATOR: string;
  DOMAIN_DEPOSIT: string;
  DOMAIN_CONTRIBUTION_AND_PROOF: string;
  UPDATE_TIMEOUT: string;
  SYNC_COMMITTEE_BRANCH_LENGTH: string;
  DEPOSIT_CHAIN_ID: string;
  DOMAIN_RANDAO: string;
  CAPELLA_FORK_VERSION: string;
  EPOCHS_PER_RANDOM_SUBNET_SUBSCRIPTION: string;
  MIN_SLASHING_PENALTY_QUOTIENT_ALTAIR: string;
  EPOCHS_PER_ETH1_VOTING_PERIOD: string;
  HISTORICAL_ROOTS_LIMIT: string;
  SYNC_COMMITTEE_SIZE: string;
  PROPORTIONAL_SLASHING_MULTIPLIER: string;
  MAX_VOLUNTARY_EXITS: string;
  HYSTERESIS_DOWNWARD_MULTIPLIER: string;
  DOMAIN_APPLICATION_BUILDER: string;
  EPOCHS_PER_SYNC_COMMITTEE_PERIOD: string;
  BYTES_PER_LOGS_BLOOM: string;
  MIN_GENESIS_ACTIVE_VALIDATOR_COUNT: string;
  MAX_ATTESTATIONS: string;
  GENESIS_FORK_VERSION: string;
  DEPOSIT_NETWORK_ID: string;
  SYNC_COMMITTEE_SUBNET_COUNT: string;
  CAPELLA_FORK_EPOCH: string;
  EJECTION_BALANCE: string;
  MAX_COMMITTEES_PER_SLOT: string;
  SHARD_COMMITTEE_PERIOD: string;
  INACTIVITY_PENALTY_QUOTIENT_ALTAIR: string;
  DOMAIN_AGGREGATE_AND_PROOF: string;
  CHURN_LIMIT_QUOTIENT: string;
  BLS_WITHDRAWAL_PREFIX: string;
}

export type Epoch = number;
export type Slot = number;

export interface AttestationReward {
  epoch: Epoch;
  attestationSlot: Slot;
  validatorIndex: number;
  inclusionDelay: number;
  target: number;
  source: number;
  head: number;
}

export interface Withdrawal {
  slot: Slot;
  blockNumber: number;
  validatorIndex: number;
  withdrawalId: number;
  address: string;
  amount?: number;
}

export interface ProposerReward {
  epoch: Epoch;
  proposerSlot: Slot;
  validatorIndex: number;
  attestationsInclusion: number;
  slashingInclusion: number;
  syncAggregateInclusion: number;
  proposalMissed: number;
  exReward: string | null;
}

export interface SyncCommitteeReward {
  epoch: Epoch;
  syncCommitteeSlot: Slot;
  validatorIndex: number;
  syncCommitteeReward: number;
}

export interface TableOptions {
  validators: string[];
  networkName: Networks;
  fiatCurrency: 'usd' | 'eur';
  startTimestamp?: number;
  endTimestamp?: number;
}
