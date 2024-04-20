import type { EthCacheService, EthClient } from '@/services/private/ethrereum';
import { ValidatorData } from '@/services/private/ethrereum/eth-cache';
import { Epoch } from '@/types';
import Decimal from 'decimal.js';

// const DEFAULT_EPOCH_FOR_SCAN = 171110; //FIXME: Restore for production
const DEFAULT_EPOCH_FOR_SCAN = 277140;

export class ValidatorsFilter {
  private client: EthClient;
  private cache: EthCacheService;

  constructor(client: EthClient, cache: EthCacheService) {
    this.client = client;
    this.cache = cache;
  }

  public async checkValidatorsEpochsForHistoryScan(
    validatorIndecies: Array<number | string>,
    startEpoch: Epoch,
    endEpoch: Epoch
  ): Promise<Array<Array<string>>> {
    //1. check validator in list
    const resultList: Array<Array<string>> = [];
    const cachedValidators = await this._getCachedValidators(
      validatorIndecies.map(i => Number(i)),
      startEpoch,
      true
    );
    if (cachedValidators) {
      for (let index = startEpoch; index < endEpoch; index++) {
        resultList.push(this._checkValidatorsPerEpoch(cachedValidators, index, true));
      }
    }
    return resultList;
  }

  public async getValidatorsForCurrentScan(startEpoch: Epoch, endEpoch: Epoch): Promise<Array<Array<string>>> {
    //1. check validator in list
    const validators = await this.cache.getValidatorsList();
    const resultList: Array<Array<string>> = [];
    if (validators && validators.length) {
      const cachedValidators = await this._getCachedValidators(validators, startEpoch, false);
      if (cachedValidators) {
        for (let index = startEpoch; index < endEpoch; index++) {
          resultList.push(this._checkValidatorsPerEpoch(cachedValidators, index, false));
        }
        return resultList;
      }
    }
    return [];
  }

  private async _getCachedValidators(
    validatorIndecies: Array<number | string>,
    epoch: number,
    isHistoryScan: boolean = true
  ) {
    const result: Array<ValidatorData> = [];
    const cachedValidators = await this.cache.getValidators(validatorIndecies.map(i => Number(i)));
    if (cachedValidators) {
      for (let i = 0; i < cachedValidators.length; i++) {
        const cachedValidator = cachedValidators[i];
        if (cachedValidator) {
          if (!isHistoryScan && cachedValidator.firstCurrentScannedEpoch === null) {
            //add firstCurrentScannedEpoch only when validor will be scanned in current epoch
            await this.cache.updateValidatorData(cachedValidator.validatorIndex, { firstCurrentScannedEpoch: epoch });
            result.push({ ...cachedValidator, firstCurrentScannedEpoch: epoch });
          } else {
            result.push(cachedValidator);
          }
        } else {
          //add new validator if he doesn't exist
          const validator = await this._addValidator(validatorIndecies[i], epoch - 1, isHistoryScan);
          if (validator) {
            result.push(validator);
          }
        }
      }
    } else {
      for (let validatorIndex of validatorIndecies) {
        //add new's validator if thye don't exists
        const validator = await this._addValidator(validatorIndex, epoch, true);
        if (validator) {
          result.push(validator);
        }
      }
    }
    return result;
  }

  private async _addValidator(
    validatorIndex: string | number,
    epoch: number,
    isHistoryScan: boolean
  ): Promise<ValidatorData | null> {
    const lastCurrentScannedEpoch = await this.cache.getLastScannedEpoch();
    const currentEpoch = await this.client.getLastFinalizedEpoch();
    const validatorStatus = await this.client.getValidatorStatus(validatorIndex);

    if (!validatorStatus) return null;

    const historyScannedEpoch = isHistoryScan
      ? validatorStatus.activationEpoch.lessThanOrEqualTo(epoch)
        ? epoch
        : validatorStatus.activationEpoch.toNumber()
      : validatorStatus.activationEpoch.lessThanOrEqualTo(DEFAULT_EPOCH_FOR_SCAN)
      ? DEFAULT_EPOCH_FOR_SCAN
      : validatorStatus.activationEpoch.toNumber();

    const data = {
      validatorIndex: Number(validatorIndex),
      activationEpoch: validatorStatus.activationEpoch.toString(),
      exitEpoch: validatorStatus.exitEpoch.toString(),
      firstCurrentScannedEpoch: isHistoryScan ? null : lastCurrentScannedEpoch ?? currentEpoch,
      historyScannedEpoch: historyScannedEpoch - 1
    };
    await this.cache.addValidator(validatorIndex, data);
    console.log('added validator', data);
    return data;
  }

  private _checkValidatorsPerEpoch(
    cachedValidators: Array<ValidatorData> | null,
    epoch: Epoch,
    isHistoryScan: boolean = true
  ) {
    const resultList: Array<string> = [];

    if (!cachedValidators) return resultList;

    for (let cachedValidator of cachedValidators) {
      if (cachedValidators) {
        if (
          (cachedValidator.exitEpoch && new Decimal(cachedValidator.exitEpoch).lessThan(epoch)) ||
          (cachedValidator.activationEpoch && new Decimal(cachedValidator.activationEpoch).greaterThan(epoch))
        )
          //main check for availablity validator to scan in given epoch
          continue;

        if (isHistoryScan) {
          //additional check if validator will be scanned in history epoch
          // it's prevent duplicate scans
          if (
            cachedValidator.historyScannedEpoch < epoch &&
            (cachedValidator.firstCurrentScannedEpoch === null ||
              (cachedValidator.firstCurrentScannedEpoch !== null && cachedValidator.firstCurrentScannedEpoch > epoch))
          ) {
            resultList.push(cachedValidator.validatorIndex.toString());
          }
        } else {
          if (cachedValidator.historyScannedEpoch < epoch) {
            resultList.push(cachedValidator.validatorIndex.toString());
          }
        }
      }
    }
    return resultList;
  }
}
