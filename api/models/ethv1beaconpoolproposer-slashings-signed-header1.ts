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

 /**
 * The [`SignedBeaconBlockHeader`](https://github.com/ethereum/consensus-specs/blob/v1.3.0/specs/phase0/beacon-chain.md#signedbeaconblockheader) object envelope from the CL spec.
 *
 * @export
 * @interface Ethv1beaconpoolproposerSlashingsSignedHeader1
 */
export interface Ethv1beaconpoolproposerSlashingsSignedHeader1 {

    /**
     * The [`BeaconBlockHeader`](https://github.com/ethereum/consensus-specs/blob/v1.3.0/specs/phase0/beacon-chain.md#beaconblockheader) object from the CL spec.
     *
     * @type {any}
     * @memberof Ethv1beaconpoolproposerSlashingsSignedHeader1
     */
    message: any;

    /**
     * @type {any}
     * @memberof Ethv1beaconpoolproposerSlashingsSignedHeader1
     * @example 0x1b66ac1fb663c9bc59509846d6ec05345bd908eda73e670af888da41af171505cc411d61252fb6cb3fa0017b679f8bb2305b26a285fa2737f175668d0dff91cc1b66ac1fb663c9bc59509846d6ec05345bd908eda73e670af888da41af171505
     */
    signature: any;
}
