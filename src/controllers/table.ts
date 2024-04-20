import { Networks } from '@/config/networks';
import { makeDetailsTable, generateSummaryTable, makeWithdrawalsTable } from '@/logic/ethereum/tables';
import { TableOptions } from '@/types';
import { assert, assertIsArray, assertIsNotNil, assertIsNumber, assertIsString } from '@/utils/assert';
import express, { NextFunction, Request, Response } from 'express';
import { not } from 'ramda';

export default (app: express.Express) => {
  app.get('/:type', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tableType = req.params.type as 'withdrawals' | 'details' | 'summary' | 'all';
      const currency = req.query.currency as 'usd' | 'eur';
      const networkName = req.query.network as Networks;
      assertIsString(req.query.validators, { status: 400, message: 'validators must be passed as  array[] strings' });
      const validators = JSON.parse(req.query.validators as string) as string[];

      const startTimestamp = parseInt(req.query.startTimestamp as string);
      const endTimestamp = parseInt(req.query.endTimestamp as string);

      assert(not(validators.length === 0), {});
      assertIsArray(validators, { status: 400, message: 'validators must be passed as  array[]' });
      assertIsString(networkName, { status: 400, message: 'network must be passed as string' });
      assertIsString(currency, {
        status: 400,
        message: 'currency must be passed as string, supported currencies: usd, eur'
      });

      assert(
        not(tableType !== 'withdrawals' && tableType !== 'details' && tableType !== 'summary' && tableType !== 'all'),
        {
          status: 400,
          message: `type must be passed as string, supported tableTypes: 'withdrawals' | 'details' | 'summary' | 'all' \n
          Example /table/withdrawals?currency=usd&network=mainnet&validators=[validator1,validator2]&startTimestamp=`
        }
      );

      assert(currency === 'usd' || currency === 'eur', {
        status: 400,
        message: `currency "${currency}" is not  supported currencies: usd, eur`
      });

      assert(not(Networks[networkName] === undefined), {
        status: 400,
        message: `network must be one of the supported networks send GET /networks to get a list of supported networks`
      });

      let result: Array<string> | null = null;
      const options: TableOptions = {
        networkName,
        validators: validators,
        fiatCurrency: currency,
        startTimestamp,
        endTimestamp
      };
      switch (tableType) {
        case 'withdrawals': {
          result = await makeWithdrawalsTable(options);
          break;
        }

        case 'details': {
          result = await makeDetailsTable(options);
          break;
        }

        case 'summary': {
          result = await generateSummaryTable(options);
          break;
        }

        case 'all': {
          const tables = await Promise.all([
            generateSummaryTable(options),
            makeDetailsTable(options),
            makeWithdrawalsTable(options)
          ]);
          result = tables.flat(1);
          break;
        }
      }

      res.send(result?.join(', '));
    } catch (err) {
      next(err);
    }
  });
};
