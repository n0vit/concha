import {
  RewardsPerEpoch,
  ValidatorRewardsPerEpoch,
} from "./get-rewards-per-epoch";
import { stringify } from "csv";
import DateTime from "moment";
import fs from "fs";
import { makeSummaryTable } from "./make-table";

const main = async () => {
  console.log("start");

  const validators = ["307560", "195558"];
  const startEpoch = 145033;
  const endEpoch = 145036;
  const rewards = [];
  const epochRewardsService = new RewardsPerEpoch(
    {
      // basePath:
      // "https://little-patient-brook.quiknode.pro/c50e511c669d66022e3059329c3d6e294d1c93c5",
      basePath:
        "https://nikolas:hIoc-SUwH-owHO-PQF4@ethereum-archive-fsn-1.allnodes.me:5051",
      baseOptions: {
        timeout: 300000,
      },
    },
    "https://nikolas:hIoc-SUwH-owHO-PQF4@ethereum-archive-fsn-1.allnodes.me:8545"
  );

  for (let i = startEpoch; i <= endEpoch; i++) {
    const epochRewards = await epochRewardsService.getRewardsPerEpoch(
      i,
      validators
    );
    rewards.push(epochRewards);
  }
  const rJson = JSON.stringify(rewards);
  var fs = require("fs");
  fs.writeFile("myjsonfile.json", rJson, "utf8");
  console.log("stop");
};

main();
