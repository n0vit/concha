import { RewardsPerEpoch } from "./get-rewards-per-epoch";

import fs from "fs";

const main = async () => {
  console.log("start");

  const validators = ["19558"];
  const startEpoch = 1;
  const endEpoch = 1100;
  const rewards = [
    {
      "19558": {
        attestationSourceReward: 3801,
        attestationSourcePenalty: 0,
        attestationTargetReward: 7065,
        attestationTargetPenalty: 0,
        attestationHeadReward: 3555,
        finalityDelayPenalty: 0,
        proposerSlashingInclusionReward: 0,
        proposerAttestationInclusionReward: 0,
        proposerSyncInclusionReward: 0,
        syncCommitteeReward: 0,
        syncCommitteePenalty: 0,
        slashingReward: 0,
        slashingPenalty: 0,
        txDeeRewardWei: 0,
        proposalsMissed: 0,
        timestamp: 1662459789,
        total: 14421,
        attestationSlot: 1,
        epoch: 145030,
      },
    },
    {
      "19558": {
        attestationSourceReward: 3800,
        attestationSourcePenalty: 0,
        attestationTargetReward: 7061,
        attestationTargetPenalty: 0,
        attestationHeadReward: 3524,
        finalityDelayPenalty: 0,
        proposerSlashingInclusionReward: 0,
        proposerAttestationInclusionReward: 0,
        proposerSyncInclusionReward: 0,
        syncCommitteeReward: 0,
        syncCommitteePenalty: 0,
        slashingReward: 0,
        slashingPenalty: 0,
        txDeeRewardWei: 0,
        proposalsMissed: 0,
        timestamp: 1662459989,
        total: 14385,
        attestationSlot: 1,
        epoch: 145031,
      },
    },
    {
      "19558": {
        attestationSourceReward: 3799,
        attestationSourcePenalty: 0,
        attestationTargetReward: 6841,
        attestationTargetPenalty: 0,
        attestationHeadReward: 3431,
        finalityDelayPenalty: 0,
        proposerSlashingInclusionReward: 0,
        proposerAttestationInclusionReward: 0,
        proposerSyncInclusionReward: 0,
        syncCommitteeReward: 0,
        syncCommitteePenalty: 0,
        slashingReward: 0,
        slashingPenalty: 0,
        txDeeRewardWei: 0,
        proposalsMissed: 0,
        timestamp: 1662484561,
        total: 14071,
        attestationSlot: 1,
        epoch: 145032,
      },
    },
    {
      "19558": {
        attestationSourceReward: 3797,
        attestationSourcePenalty: 0,
        attestationTargetReward: 7064,
        attestationTargetPenalty: 0,
        attestationHeadReward: 3409,
        finalityDelayPenalty: 0,
        proposerSlashingInclusionReward: 0,
        proposerAttestationInclusionReward: 0,
        proposerSyncInclusionReward: 0,
        syncCommitteeReward: 0,
        syncCommitteePenalty: 0,
        slashingReward: 0,
        slashingPenalty: 0,
        txDeeRewardWei: 0,
        proposalsMissed: 0,
        timestamp: 1662484561,
        total: 14270,
        attestationSlot: 1,
        epoch: 145033,
      },
    },
    {
      "19558": {
        attestationSourceReward: 3802,
        attestationSourcePenalty: 0,
        attestationTargetReward: 7063,
        attestationTargetPenalty: 0,
        attestationHeadReward: 3639,
        finalityDelayPenalty: 0,
        proposerSlashingInclusionReward: 0,
        proposerAttestationInclusionReward: 0,
        proposerSyncInclusionReward: 0,
        syncCommitteeReward: 0,
        syncCommitteePenalty: 0,
        slashingReward: 0,
        slashingPenalty: 0,
        txDeeRewardWei: 0,
        proposalsMissed: 0,
        timestamp: 1662484561,
        total: 14504,
        attestationSlot: 1,
        epoch: 145034,
      },
    },
    {
      "19558": {
        attestationSourceReward: 3802,
        attestationSourcePenalty: 0,
        attestationTargetReward: 7063,
        attestationTargetPenalty: 0,
        attestationHeadReward: 3675,
        finalityDelayPenalty: 0,
        proposerSlashingInclusionReward: 0,
        proposerAttestationInclusionReward: 0,
        proposerSyncInclusionReward: 0,
        syncCommitteeReward: 0,
        syncCommitteePenalty: 0,
        slashingReward: 0,
        slashingPenalty: 0,
        txDeeRewardWei: 0,
        proposalsMissed: 0,
        timestamp: 1662484561,
        total: 14540,
        attestationSlot: 1,
        epoch: 145035,
      },
    },
    {
      "19558": {
        attestationSourceReward: 3802,
        attestationSourcePenalty: 0,
        attestationTargetReward: 7065,
        attestationTargetPenalty: 0,
        attestationHeadReward: 3674,
        finalityDelayPenalty: 0,
        proposerSlashingInclusionReward: 0,
        proposerAttestationInclusionReward: 0,
        proposerSyncInclusionReward: 0,
        syncCommitteeReward: 0,
        syncCommitteePenalty: 0,
        slashingReward: 0,
        slashingPenalty: 0,
        txDeeRewardWei: 0,
        proposalsMissed: 0,
        timestamp: 1662484561,
        total: 14541,
        attestationSlot: 1,
        epoch: 145036,
      },
    },
    {
      "19558": {
        attestationSourceReward: 3802,
        attestationSourcePenalty: 0,
        attestationTargetReward: 7063,
        attestationTargetPenalty: 0,
        attestationHeadReward: 3675,
        finalityDelayPenalty: 0,
        proposerSlashingInclusionReward: 0,
        proposerAttestationInclusionReward: 0,
        proposerSyncInclusionReward: 0,
        syncCommitteeReward: 0,
        syncCommitteePenalty: 0,
        slashingReward: 0,
        slashingPenalty: 0,
        txDeeRewardWei: 0,
        proposalsMissed: 0,
        timestamp: 1663484561,
        total: 80,
        attestationSlot: 1,
        epoch: 145037,
      },
    },
    {
      "19558": {
        attestationSourceReward: 3802,
        attestationSourcePenalty: 0,
        attestationTargetReward: 7065,
        attestationTargetPenalty: 0,
        attestationHeadReward: 3674,
        finalityDelayPenalty: 0,
        proposerSlashingInclusionReward: 0,
        proposerAttestationInclusionReward: 0,
        proposerSyncInclusionReward: 0,
        syncCommitteeReward: 0,
        syncCommitteePenalty: 0,
        slashingReward: 0,
        slashingPenalty: 0,
        txDeeRewardWei: 0,
        proposalsMissed: 0,
        timestamp: 1663484561,
        total: 12442,
        attestationSlot: 1,
        epoch: 145038,
      },
    },
    {
      "19558": {
        attestationSourceReward: 3802,
        attestationSourcePenalty: 0,
        attestationTargetReward: 7065,
        attestationTargetPenalty: 0,
        attestationHeadReward: 3674,
        finalityDelayPenalty: 0,
        proposerSlashingInclusionReward: 0,
        proposerAttestationInclusionReward: 0,
        proposerSyncInclusionReward: 0,
        syncCommitteeReward: 0,
        syncCommitteePenalty: 0,
        slashingReward: 0,
        slashingPenalty: 0,
        txDeeRewardWei: 0,
        proposalsMissed: 0,
        timestamp: 1665484561,
        total: 140000,
        attestationSlot: 1,
        epoch: 145039,
      },
    },
    {
      "19558": {
        attestationSourceReward: 3802,
        attestationSourcePenalty: 0,
        attestationTargetReward: 7065,
        attestationTargetPenalty: 0,
        attestationHeadReward: 3674,
        finalityDelayPenalty: 0,
        proposerSlashingInclusionReward: 0,
        proposerAttestationInclusionReward: 0,
        proposerSyncInclusionReward: 0,
        syncCommitteeReward: 0,
        syncCommitteePenalty: 0,
        slashingReward: 0,
        slashingPenalty: 0,
        txDeeRewardWei: 0,
        proposalsMissed: 0,
        timestamp: 1665884561,
        total: 9999,
        attestationSlot: 1,
        epoch: 145040,
      },
    },
  ];

  const vRewards = [];
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

  // makeSummaryTable(rewards, validators, "pdf");

  for (let i = startEpoch; i <= endEpoch; i++) {
    const epochRewards = await epochRewardsService.getRewardsPerEpoch(
      i,
      validators
    );
    vRewards.push(epochRewards);
  }

  const rJson = JSON.stringify(vRewards);
  console.log("total", rJson);
  fs.writeFile("myjsonfile.json", rJson, "utf-8", (err) => {
    console.log("er", err);
  });
  console.log("stop");
};

main();
