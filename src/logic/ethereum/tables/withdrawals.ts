import { stringify } from 'csv';
import DateTime from 'moment';
import Decimal from 'decimal.js';
import { createWriteStream } from 'fs';
import { getTime, slotToEpoch, timeToSlot } from '../utils';
import Bluebird from 'bluebird';
import uniqBy from 'lodash/uniqBy';
import { DEFAULT_START_SLOT, Dirname, GWEI_TO_ETH } from '@/constants';
import { NetworksConfigs } from '@/config/networks';
import { TableOptions } from '@/types';

export const makeWithdrawalsTable = async (options: TableOptions) => {
  const filenames = [];
  const { validators, networkName, fiatCurrency, startTimestamp, endTimestamp } = options;
  const { db } = NetworksConfigs[networkName];
  const currencyId = 'amountEREUM2';

  for (let v = 0; v < validators.length; v++) {
    const validatorIndex = Number(validators[v]);

    const statSlot = startTimestamp ? Math.max(timeToSlot(startTimestamp), DEFAULT_START_SLOT) : DEFAULT_START_SLOT;
    const lastSlot = timeToSlot(DateTime.utc().unix());
    const endSlot = endTimestamp ? Math.min(timeToSlot(endTimestamp), lastSlot) : lastSlot;
    console.log('startSLot', statSlot, endSlot);
    const withdrawals = await db.readWithdrawals(validatorIndex, statSlot - 1, endSlot + 1);

    console.log('withdrawals', withdrawals.length);

    const mappedWithdrawals = await Bluebird.map(withdrawals, async withdrawal => {
      const date = getTime(withdrawal.slot ?? 0);
      const price = await db.readPrice(currencyId, date);
      const amount = GWEI_TO_ETH.mul(withdrawal.amount ?? 0);
      return {
        ...withdrawal,
        amount,
        fiatAmount: new Decimal((fiatCurrency === 'usd' ? price?.price : price?.price_eur) ?? 0).mul(amount).toDP(2),
        date,
        epoch: slotToEpoch(withdrawal.slot ?? 0)
      };
    });
    const uniqAdresses = uniqBy(mappedWithdrawals, withdraw => withdraw.address);
    const witdrawalsTotal = [];
    if (mappedWithdrawals.length > 1) {
      let tmpDate = mappedWithdrawals[0].date;
      let tmpTotal = {
        fiat: new Decimal(mappedWithdrawals[0].fiatAmount),
        amount: new Decimal(mappedWithdrawals[0].amount ?? 0)
      };
      for (let withdraw of mappedWithdrawals.slice(1)) {
        if (tmpDate.isSame(withdraw.date, 'year')) {
          tmpTotal = {
            amount: tmpTotal.amount.plus(withdraw.amount ?? 0),
            fiat: tmpTotal.fiat.plus(withdraw.fiatAmount)
          };
        } else {
          tmpDate = withdraw.date;
          witdrawalsTotal.push({ year: withdraw.date.year() - 1, ...tmpTotal });
          tmpTotal = { amount: withdraw.amount, fiat: withdraw.fiatAmount };
        }
      }
      witdrawalsTotal.push({
        year: mappedWithdrawals[mappedWithdrawals.length - 1].date.year(),
        ...tmpTotal
      });
    }

    const filename = `withdrawals-${v}.csv`;
    filenames.push(filename);
    const writableStream = createWriteStream(Dirname + '/public/' + filename);
    const stringifier = stringify({
      header: true,
      columns: [
        'date',
        'withdrawal',
        fiatCurrency === 'usd' ? 'withdrawal in USD' : 'withdrawal in EUR',
        'address',
        'block',
        'slot',
        'epoch'
      ]
    });

    mappedWithdrawals.forEach(withdraw => {
      stringifier.write([
        withdraw.date.utc(false).format('YYYY.MM.DD HH:mm:ss'),
        withdraw.amount.toDP(6).toString() + ' ETH',
        (fiatCurrency === 'usd' ? '$' : '€') + withdraw.fiatAmount.toDP(2).toString(),
        withdraw.address,
        withdraw.block_number,
        withdraw.slot,
        withdraw.epoch
      ]);
    });
    if (uniqAdresses) {
      stringifier.write(['Withdrawal adresses', ...uniqAdresses.map(a => a.address)]);
    }

    if (witdrawalsTotal) {
      witdrawalsTotal.forEach(t => {
        stringifier.write(
          [
            'Total withdrawals for ' + t.year,
            t.amount.toDP(6).toString() + ' ETH',
            (fiatCurrency === 'usd' ? '$' : '€') + t.fiat.toDP(2).toString()
          ],
          (err: any) => {
            if (err) {
              console.log('er', err);
            }
          }
        );
      });
    }

    stringifier.pipe(writableStream);
  }
  console.log(filenames);
  return filenames;
};
