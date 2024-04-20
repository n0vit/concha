import { SimpleCache } from '@/services/shared/redis/simple-cache';

export interface ValidatorData {
  activationEpoch: string;
  exitEpoch: string | null;
  firstCurrentScannedEpoch: number | null;
  validatorIndex: number;
  historyScannedEpoch: number;
}

export class EthCacheService {
  private prefix: string;
  private validatorsListPrefix: string;
  private validatorsDataPrefix: string;
  private lastScannedEpoch: string;
  constructor(network: string) {
    this.prefix = `eth:${network}:`;
    this.validatorsListPrefix = `${this.prefix}validators-list:`;
    this.validatorsDataPrefix = `${this.prefix}validators-data:`;
    this.lastScannedEpoch = `${this.prefix}last-scanned-epoch`;
  }

  public async getLastScannedEpoch() {
    const epoch = await SimpleCache.get<number | null>(this.lastScannedEpoch, null);
    if (epoch) return Number(epoch);
    return epoch;
  }

  public async setLastScannedEpoch(epoch: number) {
    await SimpleCache.set(this.lastScannedEpoch, epoch);
  }

  public async updateValidatorData(validatorIndex: string | number, validatorData: Partial<ValidatorData>) {
    // console.log('updateValidatorData', validatorIndex, validatorData);
    const index = typeof validatorIndex === 'string' ? parseInt(validatorIndex) : validatorIndex;
    const validator = await this._getValidatorData(index);
    if (validator) {
      await this._setValidatorData(index, Object.assign(validator, validatorData));
    }
  }

  public async updatedValidatorsDataHistory(validatorIndices: string[], epoch: number) {
    const data: Record<string, Partial<ValidatorData>> = {};
    validatorIndices.forEach(v => (data[v] = { historyScannedEpoch: epoch }));
    if (validatorIndices.length > 1) {
      await this.updateValidatorsData(data);
    } else if (validatorIndices.length === 1) {
      await this.updateValidatorData(validatorIndices[0], { historyScannedEpoch: epoch });
    }
  }

  public async updateValidatorsData(validatorsNewData: Record<string, Partial<ValidatorData>>) {
    try {
      const validatorIndecies = Object.keys(validatorsNewData);
      const validators = await this._getValidatorsData(validatorIndecies);
      const updatedValidatorsData: Record<string, ValidatorData> = {};
      if (validators) {
        validators.map(validator => {
          if (validator) {
            const newData = validatorsNewData[validator.validatorIndex.toString()] ?? {};
            updatedValidatorsData[`${this.validatorsDataPrefix}${validator.validatorIndex.toString()}`] = Object.assign(
              validator,
              newData
            );
          } else {
            console.log('validator not found');
          }
        });
        await this._setValidatorsData(updatedValidatorsData);
      }
    } catch (e) {
      console.log('EthCacheService: updateValidatorsData', validatorsNewData, e);
    }
  }

  public async addValidator(validatorIndex: string | number, validatorData: ValidatorData) {
    const index = typeof validatorIndex === 'string' ? parseInt(validatorIndex) : validatorIndex;
    const cachedValidator = await this._getValidatorData(index);
    if (cachedValidator) return;
    const validators = (await this._getValidators()) ?? [];
    if (!validators?.includes(index)) {
      validators?.push(index);
    }
    await this._setValidators(validators);
    await this._setValidatorData(index, validatorData);
  }

  public async removeValidator(validatorIndex: string | number) {
    const validators = await this._getValidators();
    const index = typeof validatorIndex === 'string' ? parseInt(validatorIndex) : validatorIndex;
    await this._setValidators(validators?.filter(v => v !== index) ?? []);
    await this._delValidatorData(index);
  }

  public async getValidator(validatorIndex: string | number) {
    const index = typeof validatorIndex === 'string' ? parseInt(validatorIndex) : validatorIndex;
    return await this._getValidatorData(index);
  }

  public async getValidators(validatorIndecies: Array<number | string>) {
    const validators = await this._getValidatorsData(validatorIndecies);
    return validators;
  }

  public async getValidatorsList() {
    return await this._getValidators();
  }

  private async _getValidators() {
    return await SimpleCache.get<Array<number>>(this.validatorsListPrefix, []);
  }

  private async _setValidators(validators: Array<number>) {
    await SimpleCache.set(this.validatorsListPrefix, validators);
  }

  private async _setValidatorData(validatorIndex: number, validatorData: ValidatorData) {
    return await SimpleCache.set(`${this.validatorsDataPrefix}${validatorIndex}`, validatorData);
  }

  private async _setValidatorsData(data: Record<string, ValidatorData>) {
    return await SimpleCache.multiSet(data);
  }
  private async _getValidatorsData(kyes: Array<string | number>) {
    return await SimpleCache.multiGet<Array<ValidatorData>>(kyes.map(k => `${this.validatorsDataPrefix}${k}`));
  }
  private async _getValidatorData(validatorIndex: number) {
    return await SimpleCache.get<ValidatorData | null>(`${this.validatorsDataPrefix}${validatorIndex}`, null);
  }

  private async _delValidatorData(validatorIndex: number) {
    return await SimpleCache.del(`${this.validatorsDataPrefix}${validatorIndex}`);
  }
}
