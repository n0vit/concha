ALTER TABLE  proposer_rewards_mainnet ADD COLUMN IF NOT EXISTS ex_reward        NUMERIC(24);
ALTER TABLE  proposer_rewards_mainnet ADD COLUMN IF NOT EXISTS price            double precision;
ALTER TABLE  proposer_rewards_mainnet ADD COLUMN IF NOT EXISTS price_eur        double precision;


ALTER TABLE  attestation_rewards_mainnet ADD COLUMN IF NOT EXISTS price         double precision;
ALTER TABLE  attestation_rewards_mainnet ADD COLUMN IF NOT EXISTS price_eur     double precision;

ALTER TABLE  sync_committee_rewards_mainnet ADD COLUMN IF NOT EXISTS price      double precision;
ALTER TABLE  sync_committee_rewards_mainnet ADD COLUMN IF NOT EXISTS price_eur  double precision;

ALTER TABLE sync_committee_rewards_mainnet  DROP CONSTRAINT IF EXISTS sync_committee_rewards_mainnet_epoch_validator_index_key;
ALTER TABLE  sync_committee_rewards_mainnet DROP CONSTRAINT IF EXISTS unique_rows;
ALTER TABLE  sync_committee_rewards_mainnet ADD CONSTRAINT  unique_rows UNIQUE (epoch, validator_index, slot);