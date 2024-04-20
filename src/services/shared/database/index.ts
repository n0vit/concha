import { allnodesClient, localClient } from "./clients";
export * from "./database";

export const dbClients = {
  allnodes: allnodesClient,
  local: localClient,
};
