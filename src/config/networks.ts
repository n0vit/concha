import { EthCacheService, EthDBService, EthClient } from '@/services/private/ethrereum';
import { appConfig } from '@/config';

export interface NetworkConfig {
  name: string;
  client: EthClient;
  clients: EthClient[];
  cache: EthCacheService;
  db: EthDBService;
}
enum EthNetworks {
  'mainnet' = 'mainnet',
  'holesky' = 'holesky'
}

export type Networks = EthNetworks;
export const Networks = {
  ...EthNetworks
};

export const NetworksConfigs: Record<EthNetworks, NetworkConfig> = {
  [EthNetworks.mainnet]: {
    name: EthNetworks.mainnet,
    ...getClients(appConfig.ethBeaconEndpoints[EthNetworks.mainnet]),
    cache: new EthCacheService(EthNetworks.mainnet),
    db: new EthDBService(EthNetworks.mainnet)
  },
  [EthNetworks.holesky]: {
    name: EthNetworks.holesky,
    ...getClients(appConfig.ethBeaconEndpoints[EthNetworks.holesky]),
    cache: new EthCacheService(EthNetworks.holesky),
    db: new EthDBService(EthNetworks.holesky)
  }
};
// Just smaill util for reduce class recreation and reduce code size in others compomnents
function getClients(
  endpoints: {
    CL: string;
    EL: string;
  }[]
) {
  if (endpoints.length === 0) throw new Error('No endpoints provided, please check config');

  const clients: EthClient[] = endpoints.slice(0).map(
    endpoint =>
      new EthClient(
        {
          // basePath:
          //   "https://little-patient-brook.quiknode.pro/c50e511c669d66022e3059329c3d6e294d1c93c5",
          basePath: endpoint.CL,
          baseOptions: {
            timeout: 300000
          }
        },
        endpoint.EL
      )
  );
  return { clients, client: clients[0] };
}
