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
 * 
 *
 * @export
 * @interface ValidatorResponseValidator
 */
export interface ValidatorResponseValidator {

    /**
     * The validator's BLS public key, uniquely identifying them. _48-bytes, hex encoded with 0x prefix, case insensitive._
     *
     * @type {any}
     * @memberof ValidatorResponseValidator
     * @example 0x93247f2209abcacf57b75a51dafae777f9dd38bc7053d1af526f220a7489a6d3a2753e5f3e8b1cfe39b56f43611df74a
     */
    pubkey: any;

    /**
     * Root of withdrawal credentials
     *
     * @type {any}
     * @memberof ValidatorResponseValidator
     * @example 0xcf8e0d4e9587369b2301d0790347320302cc0943d5a1884560367e8208d920f2
     */
    withdrawalCredentials: any;

    /**
     * Balance at stake in Gwei.
     *
     * @type {any}
     * @memberof ValidatorResponseValidator
     * @example 1
     */
    effectiveBalance: any;

    /**
     * Was validator slashed (not longer active).
     *
     * @type {any}
     * @memberof ValidatorResponseValidator
     * @example false
     */
    slashed: any;

    /**
     * When criteria for activation were met.
     *
     * @type {any}
     * @memberof ValidatorResponseValidator
     * @example 1
     */
    activationEligibilityEpoch: any;

    /**
     * Epoch when validator activated. 'FAR_FUTURE_EPOCH' if not activated
     *
     * @type {any}
     * @memberof ValidatorResponseValidator
     * @example 1
     */
    activationEpoch: any;

    /**
     * Epoch when validator exited. 'FAR_FUTURE_EPOCH' if not exited.
     *
     * @type {any}
     * @memberof ValidatorResponseValidator
     * @example 1
     */
    exitEpoch: any;

    /**
     * When validator can withdraw or transfer funds. 'FAR_FUTURE_EPOCH' if not defined
     *
     * @type {any}
     * @memberof ValidatorResponseValidator
     * @example 1
     */
    withdrawableEpoch: any;
}
