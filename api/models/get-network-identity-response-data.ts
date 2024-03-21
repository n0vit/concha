/* tslint:disable */
/* eslint-disable */
/**
 * Eth Beacon Node API
 * API specification for the beacon node, which enables users to query and participate in Ethereum 2.0 phase 0 beacon chain.  All requests by default send and receive JSON, and as such should have either or both of the \"Content-Type: application/json\" and \"Accept: application/json\" headers.  In addition, some requests can return data in the SSZ format.  To indicate that SSZ data is required in response to a request the header \"Accept: application/octet-stream\" should be sent.  Note that only a subset of requests can respond with data in SSZ format; these are noted in each individual request.  API endpoints are individually versioned.  As such, there is no direct relationship between all v1 endpoints, all v2 endpoints, _etc._ and no such relationship should be inferred.  All JSON responses return the requested data under a `data` key in the top level of their response.  Additional metadata may or may not be present in other keys at the top level of the response, dependent on the endpoint.  The rules that require an increase in version number are as follows:    - no field that is listed in an endpoint shall be removed without an increase in the version number   - no field that is listed in an endpoint shall be altered in terms of format (_e.g._ from a string to an array) without an     increase in the version number  Note that it is possible for a field to be added to an endpoint's data or metadata without an increase in the version number. 
 *
 * OpenAPI spec version: v2.5.0 - Ethereum Proof-of-Stake Consensus Specification v1.4.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import { NetworkIdentityMetadata } from './network-identity-metadata';
 /**
 * 
 *
 * @export
 * @interface GetNetworkIdentityResponseData
 */
export interface GetNetworkIdentityResponseData {

    /**
     * Cryptographic hash of a peer’s public key. [Read more](https://docs.libp2p.io/concepts/peer-id/)
     *
     * @type {any}
     * @memberof GetNetworkIdentityResponseData
     * @example QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx5N
     */
    peerId: any;

    /**
     * Ethereum node record. [Read more](https://eips.ethereum.org/EIPS/eip-778)
     *
     * @type {any}
     * @memberof GetNetworkIdentityResponseData
     * @example enr:-IS4QHCYrYZbAKWCBRlAy5zzaDZXJBGkcnh4MHcBFZntXNFrdvJjX04jRzjzCBOonrkTfj499SZuOh8R33Ls8RRcy5wBgmlkgnY0gmlwhH8AAAGJc2VjcDI1NmsxoQPKY0yuDUmstAHYpMa2_oxVtw0RW_QAdpzBQA8yWM0xOIN1ZHCCdl8
     */
    enr: any;

    /**
     * @type {any}
     * @memberof GetNetworkIdentityResponseData
     */
    p2pAddresses: any;

    /**
     * @type {any}
     * @memberof GetNetworkIdentityResponseData
     */
    discoveryAddresses: any;

    /**
     * @type {NetworkIdentityMetadata}
     * @memberof GetNetworkIdentityResponseData
     */
    metadata: NetworkIdentityMetadata;
}
