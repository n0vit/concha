DO
$$
  BEGIN
    CREATE TYPE ETHEREUM_NETWORK_NAME AS ENUM ('mainnet', 'holesky');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END
$$;


CREATE TABLE IF NOT EXISTS  missed_epochs (
  id                        SERIAL  PRIMARY KEY NOT NULL,
  network_name              ETHEREUM_NETWORK_NAME NOT NULL,
  epoch                     INTEGER  NOT NULL,
  validator_indices         INTEGER[],
  is_all_validators         BOOLEAN NOT NULL,
  created                   TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
  UNIQUE(epoch, network_name)
);
