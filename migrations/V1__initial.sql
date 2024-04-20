CREATE TABLE IF NOT EXISTS  attestation_rewards_mainnet (
  id                        SERIAL  PRIMARY KEY NOT NULL,
  epoch                                 INTEGER NOT NULL,
  validator_index                       INTEGER NOT NULL,
  source                                INTEGER,
  target                                INTEGER,
  head                                  INTEGER,
  finality_delay_penalty                INTEGER,
  slot                                  INTEGER,
  created                TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
  UNIQUE(epoch, validator_index)
);


CREATE TABLE IF NOT EXISTS  sync_committee_rewards_mainnet (
  id                        SERIAL  PRIMARY KEY NOT NULL,
  epoch                                 INTEGER NOT NULL,
  validator_index                       INTEGER NOT NULL,
  sync_committee_reward                 INTEGER NOT NULL,
  slot                                  INTEGER,
  created                TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
  UNIQUE(epoch, validator_index)
);


CREATE TABLE IF NOT EXISTS  proposer_rewards_mainnet (
  id                        SERIAL  PRIMARY KEY NOT NULL,
  epoch                                 INTEGER NOT NULL,
  validator_index                       INTEGER NOT NULL,
  slashing_inclusion_reward             INTEGER NOT NULL,
  attestation_inclusion_reward          INTEGER NOT NULL,
  sync_inclusion_reward                 INTEGER NOT NULL,
  proposals_missed                      SMALLINT NOT NULL,
  slot                                  INTEGER,
  created               TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
  UNIQUE(epoch, validator_index)
);




CREATE INDEX IF NOT EXISTS attestation_rewards_mainnet_idx ON attestation_rewards_mainnet (validator_index ASC, epoch DESC);
CREATE INDEX IF NOT EXISTS sync_committee_rewards_mainnet_idx ON sync_committee_rewards_mainnet (validator_index ASC, epoch DESC);
CREATE INDEX IF NOT EXISTS proposer_rewards_mainnet_idx ON proposer_rewards_mainnet (validator_index ASC, epoch DESC);
