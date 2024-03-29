import { RewardsClient } from "@/services/client";
import { getRewardsPerEpoch } from "./get-rewards-per-epoh";
import { ValidatorRewardsModel } from "@/models/validator-rewards";
import { createLoggingMoudule } from "@/utils";

import { SimpleCache } from "@/services/redis/simple-cache";
import type { ValidatorRewardsBase } from "@/entites/validator-rewards";
import { appConfig } from "@/config";

const ethReawardslog = createLoggingMoudule("EthRewardsCanner");
const scanHistorylog = createLoggingMoudule("ScanRewardsHisroty");
export async function EthRewardsCanner(
  scanRangeEpochPerIteration: number = 1,
  networkName: "holesky" | "mainnet" = "mainnet"
) {
  ethReawardslog.info("start");
  const client = new RewardsClient(
    {
      // basePath:
      //   "https://little-patient-brook.quiknode.pro/c50e511c669d66022e3059329c3d6e294d1c93c5",
      basePath: appConfig.ethBeaconEndpoints[networkName].CL,
      baseOptions: {
        timeout: 300000,
      },
    },
    appConfig.ethBeaconEndpoints[networkName].EL
  );
  ethReawardslog.info("rewards client created");
  ethReawardslog.info("start scanning historical rewards");
  await scanRewardsHisroty(scanRangeEpochPerIteration, client);
  ethReawardslog.info("finish scanning historical rewards");
  ethReawardslog.info("start subscribe to new rewards");

  ethReawardslog.info("stop");
}

//apt install python
//git clone https://github.com/n0vit/concha
//curl -fsSL https://get.pnpm.io/install.sh | sh -
//curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
//source /root/.bashrc
//nvm install 20

async function RewardsSubscriber(client: RewardsClient) {
  const newEpoch = await client.subscribeToFinalizedEpoch();
}

async function scanRewardsHisroty(
  scanRangeEpochPerIteration: number = 5,
  client: RewardsClient
) {
  scanHistorylog.info(
    `start scanRangeEpochPerIteration: ${scanRangeEpochPerIteration}`
  );

  const startEpoch = 171039;
  // ((await SimpleCache.get<number>("eth-last-scanned-epoch", 0)) ?? -1) + 1;
  let endEpoch = await client.getLastFinalizedEpoch();

  let maxEpochForIteration = startEpoch;
  for (let i = startEpoch; i <= endEpoch; i += scanRangeEpochPerIteration) {
    maxEpochForIteration = i + scanRangeEpochPerIteration;
    if (maxEpochForIteration > endEpoch) {
      endEpoch = await client.getLastFinalizedEpoch(); // update to last ephoch
      scanHistorylog.debug(`updated endEpoch to last ephoch ${endEpoch}`);
      if (maxEpochForIteration > endEpoch) {
        maxEpochForIteration = endEpoch;
      }
    }

    const asyncRequests = [];
    for (let j = i; j < maxEpochForIteration; j++) {
      asyncRequests.push(getRewardsPerEpoch(client, j));
    }

    scanHistorylog.debug(
      `call asyncRequests for epoch ${i} - ${maxEpochForIteration - 1}`
    );
    const epochRewardsArray = await Promise.all(asyncRequests);

    scanHistorylog.debug(
      `get epochRewardsArray length: ${
        epochRewardsArray.length
      } for epoch ${i} - ${maxEpochForIteration - 1}`
    );
    for (let index = 0; index < epochRewardsArray.length; index++) {
      const epochRewards = epochRewardsArray[index];

      scanHistorylog.info(
        `writeEpochRewards epoch: ${index} rows: ${
          Object.keys(epochRewards ?? {}).length
        }`
      );

      await writeEpochRewards(epochRewards);
    }
  }
  scanHistorylog.info("finish");
}

async function writeEpochRewards(
  epochRewards: Record<number, ValidatorRewardsBase> | null,
  network: "holesky" | "mainnet" = "mainnet"
) {
  if (epochRewards) {
    const epochRewardsValidators = Object.keys(epochRewards);
    if (epochRewardsValidators.length > 0) {
      for (let index = 0; index < epochRewardsValidators.length; index++) {
        try {
          const validatorIndex = Number(epochRewardsValidators[index]);
          const validatorRewards = epochRewards[validatorIndex];
          const rewardsModel = new ValidatorRewardsModel();
          rewardsModel.fromAPI(validatorRewards, validatorIndex, network);

          await rewardsModel.save();
        } catch (e) {
          scanHistorylog.error(e);
        }
        if (epochRewardsValidators.length > 0) {
          const firstValidatorIndex = Number(epochRewardsValidators[0]);
          const firstValidatorRewards = epochRewards[firstValidatorIndex];
          await SimpleCache.set(
            "eth-last-scanned-epoch",
            firstValidatorRewards.epoch
          );
        }
      }
    }
  }
}
