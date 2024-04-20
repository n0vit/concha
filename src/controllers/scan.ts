import { Networks } from '@/config/networks';
import { EthHistoryQueue } from '@/services/private/ethrereum/eth-mq';
import { assert, assertIsArray, assertIsString } from '@/utils/assert';

import { randomUUID } from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import { not } from 'ramda';

export default (app: express.Express) => {
  app.post(
    '/start',
    async (
      req: Request<
        any,
        any,
        {
          network: string;
          currency: string;
          validators: string[];
          startTimestamp: number;
          endTimestamp: number;
        }
      >,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const networkName = req.body.network as Networks;
        const validatorIndices = req.body.validators;
        console.log(req);
        assertIsArray(validatorIndices, { status: 400, message: 'validators must be passed as  array[]' });
        assertIsString(networkName, { status: 400, message: 'network must be passed as string' });
        assert(not(Networks[networkName] === undefined), {
          status: 400,
          message: `network must be one of the supported networks send GET /networks to get a list of supported networks`
        });

        await EthHistoryQueue.add(randomUUID(), { networkName, validatorIndices });

        res.sendStatus(201);
      } catch (err) {
        next(err);
      }
    }
  );
};
