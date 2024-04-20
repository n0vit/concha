import { stringify } from 'csv';
import DateTime from 'moment';
import fs from 'fs';
import Decimal from 'decimal.js';
import { getTime, timeToSlot } from '../utils';
import { DEFAULT_START_SLOT, Dirname, GWEI_TO_ETH } from '@/constants';
import { BigNumber } from '@/utils/big-number';
import { NetworksConfigs } from '@/config/networks';
import { TableOptions } from '@/types';

export const generateSummaryTable = async (options: TableOptions) => {
  const filenames = [];
  const { validators, networkName, fiatCurrency, startTimestamp, endTimestamp } = options;
  const { db } = NetworksConfigs[networkName];
  for (let v = 0; v < validators.length; v++) {
    const validatorIndex = Number(validators[v]);
    console.log(validatorIndex, validators[v]);
    const statSlot = startTimestamp ? Math.max(timeToSlot(startTimestamp), DEFAULT_START_SLOT) : DEFAULT_START_SLOT;
    const lastSlot = timeToSlot(DateTime.utc().unix());
    const endSlot = endTimestamp ? Math.min(timeToSlot(endTimestamp), lastSlot) : lastSlot;

    console.log('startSLot', statSlot, endSlot);
    const rewards = await db.readSummaryTabelData(validatorIndex, statSlot - 1, endSlot + 1);

    const mappedRewards = rewards
      .map(reward => {
        if (!reward) return undefined;
        const price =
          fiatCurrency === 'usd'
            ? reward.attestation_price || reward.proposer_price || reward.sync_committee_price || 0
            : reward.attestation_price_eur || reward.proposer_price_eur || reward.sync_committee_price_eur || 0;
        return {
          total: new BigNumber(reward.total ?? 0),
          epoch: reward.epoch,
          totalInFiat: GWEI_TO_ETH.mul(reward.total ?? 0).mul(price),
          date: getTime(reward?.slot ?? (reward.epoch ?? 0) * 32).utc(false)
        };
      })
      .filter(Boolean) as unknown as Array<{
      total: Decimal;
      totalInFiat: Decimal;
      date: DateTime.Moment;
      epoch: string;
    }>;

    if (mappedRewards.length === 0) return [];

    const groupedRewards: Array<{
      total: Decimal;
      date: DateTime.Moment;
      epoch: string;
      totalInFiat: Decimal;
    }> = [];

    if (mappedRewards.length > 1) {
      const firstReward = mappedRewards[0];
      let dayTimestamp = firstReward.date;
      let tmpRewards = {
        total: firstReward.total,
        totalInFiat: firstReward.totalInFiat,
        epoch: '',
        date: firstReward.date
      };
      let tmpStartEpoch = firstReward.epoch;
      let tmpEndEpoch = firstReward.epoch;
      for (let mappedReward of mappedRewards.slice(1)) {
        if (dayTimestamp.isSame(mappedReward.date, 'day')) {
          tmpEndEpoch = mappedReward.epoch;
          tmpRewards = {
            totalInFiat: mappedReward.totalInFiat.plus(tmpRewards.totalInFiat),
            total: mappedReward.total.plus(tmpRewards.total),
            epoch: '',
            date: tmpRewards.date
          };
        } else {
          // console.log('tmp epx', tmpEpoch, tmpEpoch[tmpEpoch.length - 1]);
          groupedRewards.push({
            total: GWEI_TO_ETH.mul(tmpRewards.total),
            totalInFiat: tmpRewards.totalInFiat.toDP(2),
            date: tmpRewards.date,
            epoch: tmpStartEpoch !== tmpEndEpoch ? `${tmpStartEpoch} - ${tmpEndEpoch}` : tmpStartEpoch.toString()
          });
          tmpRewards = {
            total: mappedReward.total,
            epoch: '',
            date: mappedReward.date,
            totalInFiat: mappedReward.totalInFiat
          };
          tmpStartEpoch = mappedReward.epoch;
          tmpEndEpoch = mappedReward.epoch;
          dayTimestamp = mappedReward.date;
        }
      }

      //add tail if all rewards are on same day
      groupedRewards.push({
        total: GWEI_TO_ETH.mul(tmpRewards.total),
        totalInFiat: tmpRewards.totalInFiat.toDP(2),
        date: tmpRewards.date,
        epoch: tmpStartEpoch !== tmpEndEpoch ? `${tmpStartEpoch} - ${tmpEndEpoch}` : tmpStartEpoch.toString()
      });
    } else if (mappedRewards.length > 0) {
      //add rewards if there is only one
      groupedRewards.push({
        total: GWEI_TO_ETH.mul(mappedRewards[0].total),
        totalInFiat: mappedRewards[0].totalInFiat.toDP(2),
        epoch: mappedRewards[0].epoch.toString(),
        date: mappedRewards[0].date
      });
    }

    const yearsTotal = [];
    if (groupedRewards.length > 1) {
      let tmpDate = groupedRewards[0].date;
      let tmpTotal = { fiat: groupedRewards[0].totalInFiat, eth: groupedRewards[0].total };
      for (let reward of groupedRewards.slice(1)) {
        if (tmpDate.isSame(reward.date, 'year')) {
          tmpTotal = {
            eth: reward.total.plus(tmpTotal.eth),
            fiat: reward.totalInFiat.plus(tmpTotal.fiat)
          };
        } else {
          tmpDate = reward.date;
          yearsTotal.push({ year: reward.date.year() - 1, ...tmpTotal });
          tmpTotal = { eth: reward.total, fiat: reward.totalInFiat };
        }
      }
      yearsTotal.push({
        year: groupedRewards[groupedRewards.length - 1].date.year(),
        ...tmpTotal
      });
    }

    const filename = `summary-${v}-${DateTime.utc().day()}.csv`;
    filenames.push(filename);
    const writableStream = fs.createWriteStream(Dirname + '/public/' + filename);
    const stringifier = stringify({
      header: true,
      columns: [
        'date',
        'total rewards',
        fiatCurrency === 'usd' ? 'total rewards in USD' : 'total rewards in EUR',
        'epoch'
      ]
    });
    console.log(filenames);

    groupedRewards.forEach(groupedReward => {
      stringifier.write(
        [
          groupedReward.date.format('YYYY.MM.DD'),
          groupedReward.total + ' ETH',
          (fiatCurrency === 'usd' ? '$' : '€') + groupedReward.totalInFiat.toFixed(2),
          groupedReward.epoch
        ],
        (err: any) => {
          if (err) {
            console.log('er', err);
          }
        }
      );
    });

    yearsTotal.forEach(y => {
      stringifier.write(
        ['Total for ' + y.year, y.eth.toFixed(6) + ' ETH', (fiatCurrency === 'usd' ? '$' : '€') + y.fiat.toFixed(2)],
        (err: any) => {
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
