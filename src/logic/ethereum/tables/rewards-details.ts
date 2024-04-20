import { stringify } from 'csv';
import DateTime from 'moment';
import fs from 'fs';
import Decimal from 'decimal.js';
import { getTime, timeToSlot } from '../utils';
import { DEFAULT_START_SLOT, Dirname, GWEI_TO_ETH } from '@/constants';
import { TableOptions } from '@/types';
import { NetworksConfigs } from '@/config/networks';

interface DetailsRow {
  type: string;
  date: string;
  epoch: string;
  slot: number;
  totalInFiat: Decimal;
  total: Decimal;
}

export const generateDetailsTable = async (options: TableOptions) => {
  const filenames = [];
  const { validators, networkName, fiatCurrency, startTimestamp, endTimestamp } = options;
  const { db } = NetworksConfigs[networkName];
  for (let v = 0; v < validators.length; v++) {
    const validatorIndex = Number(validators[v]);
    const statSlot = startTimestamp ? Math.max(timeToSlot(startTimestamp), DEFAULT_START_SLOT) : DEFAULT_START_SLOT;
    const lastSlot = timeToSlot(DateTime.utc().unix());
    const endSlot = endTimestamp ? Math.min(timeToSlot(endTimestamp), lastSlot) : lastSlot;

    console.log('startSLot', statSlot, endSlot);
    const rewards = await db.readRewardsDetailsData(validatorIndex, statSlot - 1, endSlot + 1);
    const mappedRewards = rewards
      .map(validatorRewards => {
        return {
          type: validatorRewards.table,
          slot: validatorRewards.slot,
          date: getTime(validatorRewards.slot ?? 1)
            .utc(false)
            .format('YYYY.MM.DD HH:mm:ss'),
          epoch: validatorRewards?.epoch?.toString() ?? '',
          totalInFiat: GWEI_TO_ETH.mul(validatorRewards.total ?? 0).mul(
            fiatCurrency === 'usd' ? validatorRewards.price || 0 : validatorRewards.price_eur || 0
          ),
          total: GWEI_TO_ETH.mul(validatorRewards.total ?? 0)
        } as DetailsRow;
      })
      .filter(Boolean) as DetailsRow[];

    const filename = `details-${validatorIndex}.csv`;
    filenames.push(filename);

    const writableStream = fs.createWriteStream(Dirname + '/public/' + filename);
    const stringifier = stringify({
      header: true,
      columns: [
        'date',
        'reward',
        fiatCurrency === 'usd' ? ' reward in USD' : 'reward in EUR',
        'reward type',
        'epoch',
        'slot'
      ]
    });

    mappedRewards.forEach(reward => {
      stringifier.write(
        [
          reward.date,
          reward.total.toString() + ' ETH',
          (fiatCurrency === 'usd' ? '$' : '€') + reward.totalInFiat.toFixed(6),
          reward.type,
          reward.epoch,
          reward.slot
        ],
        err => {
          if (err) {
            console.log('er', err);
          }
        }
      );
    });
    stringifier.pipe(writableStream);
  }
  return filenames;
};
