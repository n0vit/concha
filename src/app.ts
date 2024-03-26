import {
  RewardsPerEpoch,
  ValidatorRewardsPerEpoch,
} from "./get-rewards-per-epoch";

import jsn from "../myjsonfile.json";
import fs from "fs";
import { makeDetailsTable, makeSummaryTable } from "./make-table";

const main = async () => {
  console.log("start");

  const validators = ["19558"];
  const startEpoch = 1;
  const endEpoch = 1100;
  const rewards = jsn as Record<string, ValidatorRewardsPerEpoch>[];
  // const vRewards = [];
  const epochRewardsService = new RewardsPerEpoch(
    {
      // basePath:
      // "https://little-patient-brook.quiknode.pro/c50e511c669d66022e3059329c3d6e294d1c93c5",
      basePath:
        "https://ethereum-archive-epyc-8.allnodes.me:5052/hIoc-SUwH-owHO-PQF4",
      baseOptions: {
        timeout: 300000,
      },
    },
    "https://ethereum-archive-epyc-8.allnodes.me:8545/hIoc-SUwH-owHO-PQF4"
  );

  makeSummaryTable(rewards, validators, "pdf");
  makeDetailsTable(rewards, validators, "csv");

  // for (let i = startEpoch; i <= endEpoch; i++) {
  //   const epochRewards = await epochRewardsService.getRewardsPerEpoch(
  //     i,
  //     validators
  //   );
  //   vRewards.push(epochRewards);
  // }

  // const rJson = JSON.stringify(vRewards);
  // console.log("total", rJson);
  // fs.writeFile("myjsonfile.json", rJson, "utf-8", (err) => {
  //   console.log("er", err);
  // });
  console.log("stop");
};

main();
