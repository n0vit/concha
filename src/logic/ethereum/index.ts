import { generateSummaryTable, makeDetailsTable } from './tables';
import { makeWithdrawalsTable } from './tables/withdrawals';

export const EthCore = {
  makeDetailsTable,
  makeSummaryTable: generateSummaryTable,
  makeWithdrawalsTable
};
