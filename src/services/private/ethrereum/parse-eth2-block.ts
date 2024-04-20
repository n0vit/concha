import {
  TekuBellatrixBlockResponse,
  TekuBlockResponse,
  TekuCapellaBlockResponse,
  TekuDenebBlockResponse
} from '@/types/ethereum';
import { assertIsNumber, assert } from '@/utils/assert';

interface PayloadParseEth2Block {
  slot: number;
  eth2BlockResponse: TekuBellatrixBlockResponse | TekuCapellaBlockResponse | TekuDenebBlockResponse;
}

/**
 *
 */
export interface BlockV2 {
  eth2BlockBody: TekuBlockResponse['data']['message']['body'];
  eth2Slot: number;
  eth2BlockNumber: number;
  eth2BlockTimestamp: number;
  eth2BaseFeePerGas: number;
  eth2ProposerIndex: number;
  withdrawals: TekuCapellaBlockResponse['data']['message']['body']['execution_payload']['withdrawals'];
}
/**
 *
 * @param payload
 */
export function parseEth2Block(payload: PayloadParseEth2Block): BlockV2 {
  const eth2Block = payload.eth2BlockResponse;
  const { body: eth2BlockBody } = eth2Block.data.message;
  const eth2Slot = parseInt(eth2Block.data.message.slot);
  const eth2BlockNumber = parseInt(eth2BlockBody.execution_payload.block_number);
  const eth2BlockTimestamp = parseInt(eth2BlockBody.execution_payload.timestamp);
  const eth2BaseFeePerGas = parseInt(eth2BlockBody.execution_payload.base_fee_per_gas);
  const eth2ProposerIndex = parseInt(eth2Block.data.message.proposer_index);

  assertIsNumber(eth2Slot, { message: 'INVALID_ETH2_SLOT' });
  assert(payload.slot === eth2Slot, { message: 'INVALID_ETH2_SLOT' });
  assertIsNumber(eth2BlockNumber, { message: 'INVALID_ETH2_BLOCK_NUMBER' });
  assertIsNumber(eth2BlockTimestamp, { message: 'INVALID_ETH2_BLOCK_TIMESTAMP' });
  assertIsNumber(eth2BaseFeePerGas, { message: 'INVALID_ETH2_BASE_FEE_PER_GAS' });
  assertIsNumber(eth2ProposerIndex, { message: 'INVALID_ETH2_PROPOSER_INDEX' });

  return {
    eth2BlockBody,
    eth2Slot,
    eth2BlockNumber,
    eth2BlockTimestamp,
    eth2BaseFeePerGas,
    eth2ProposerIndex,
    withdrawals: eth2Block.data.message.body.execution_payload?.withdrawals ?? []
  };
}
