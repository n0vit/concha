import Decimal from 'decimal.js';
import path from 'path';
import { fileURLToPath } from 'url';

export const GENESIS_TIME = 1606824023;
export const SECONDS_PER_SLOT = 12;
export const SLOTS_PER_EPOCH = 32;
export const ALTAIR_EPOCH = 74240;
export const DEFAULT_START_HISTORY_EPOCH = 171112;
export const DEFAULT_START_SLOT = 5475599; // 2023 01.01 00:00:11 UTC First block in 2023 year

export const staderSocializingPoolAddress = '0x1de458031bfbe5689ded5a8b9ed57e1e79eab2a4';
export const rocketPoolSmoothingPoolAddress = '0xd4e96ef8eee8678dbff4d535e033ed1a4f7605b7';

export const GWEI_TO_ETH = new Decimal(10).pow(-9);

export const WHEI_TO_GWEI = new Decimal(10).pow(-9);

const __filename = fileURLToPath(import.meta.url);
export const Dirname = path.dirname(__filename);
