CREATE TABLE IF NOT EXISTS  withdrawals_mainnet (
  withdrawal_index                      INTEGER PRIMARY KEY NOT NULL,
  slot                                  INTEGER NOT NULL,
  block_number                          INTEGER NOT NULL,
  validator_index                       INTEGER NOT NULL,
  address                               CHAR(42) NOT NULL,
  amount                                BIGINT NOT NULL,
  created    TIMESTAMP WITH TIME ZONE   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS withdrawals_mainnet_idx ON
             withdrawals_mainnet (validator_index ASC, slot ASC);