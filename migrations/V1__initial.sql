DO
$$
  BEGIN
    CREATE TYPE ETHEREUM_NETWORK_NAME AS ENUM ('mainnet', 'holesky');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END
$$;

CREATE TABLE IF NOT EXISTS validator_rewards (
  id                        SERIAL  PRIMARY KEY NOT NULL,
  network_name              ETHEREUM_NETWORK_NAME NOT NULL,
  epoch                                 INTEGER NOT NULL,
  validator_index                       INTEGER NOT NULL,
  attestation_slot                      INTEGER,
  attestation_rewards                   INTEGER,
  proposer_rewards                      INTEGER,
  proposals_missed                      SMALLINT,
  sync_committee_rewards                INTEGER,
  total_reward_amount                   INTEGER,
  timestamp                             TIMESTAMP,
  created                TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
  datetime               TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
  UNIQUE(epoch, validator_index)
);

CREATE INDEX IF NOT EXISTS validator_rewards_validator_index_idx ON validator_rewards (validator_index ASC, network_name);
CREATE INDEX IF NOT EXISTS validator_rewards_epoch_idx ON validator_rewards (epoch DESC, network_name);