export class ValidatorRewardsBase {
  public attestationSourceReward: number;
  public attestationSourcePenalty: number; // added this line
  public attestationTargetReward: number;
  public attestationTargetPenalty: number;
  public attestationHeadReward: number;
  public attestationSlot: number;
  public finalityDelayPenalty: number;

  public proposerSlashingInclusionReward: number; // added semicolon
  public proposerAttestationInclusionReward: number;
  public proposerSyncInclusionReward: number;

  public syncCommitteeReward: number;
  public syncCommitteePenalty: number;
  // slashingReward: number;
  // slashingPenalty: number;
  public proposalsMissed: number;
  public timestamp: string;
  public total: number;
  public epoch: number;
  public validatorAddress: string;

  constructor(
    obj: ValidatorRewardsBase = {
      attestationSourceReward: 0,
      attestationSourcePenalty: 0,
      attestationTargetReward: 0,
      attestationTargetPenalty: 0,
      attestationHeadReward: 0,
      attestationSlot: 0,
      finalityDelayPenalty: 0,
      proposerSlashingInclusionReward: 0,
      proposerAttestationInclusionReward: 0,
      proposerSyncInclusionReward: 0,
      syncCommitteeReward: 0,
      syncCommitteePenalty: 0,
      proposalsMissed: 0,
      timestamp: "",
      total: 0,
      epoch: 0,
      validatorAddress: "",
    }
  ) {
    this.proposalsMissed = obj.proposalsMissed;
    this.attestationSourceReward = obj.attestationSourceReward;
    this.attestationSourcePenalty = obj.attestationSourcePenalty;
    this.attestationTargetReward = obj.attestationTargetReward;
    this.attestationTargetPenalty = obj.attestationTargetPenalty;
    this.attestationHeadReward = obj.attestationHeadReward;
    this.attestationSlot = obj.attestationSlot;
    this.finalityDelayPenalty = obj.finalityDelayPenalty;
    this.proposerSlashingInclusionReward = obj.proposerSlashingInclusionReward;
    this.proposerAttestationInclusionReward =
      obj.proposerAttestationInclusionReward;
    this.proposerSyncInclusionReward = obj.proposerSyncInclusionReward;
    this.syncCommitteeReward = obj.syncCommitteeReward;
    this.syncCommitteePenalty = obj.syncCommitteePenalty;
    this.timestamp = obj.timestamp;
    this.total = obj.total;
    this.epoch = obj.epoch;
    this.validatorAddress = obj.validatorAddress;
  }
}
