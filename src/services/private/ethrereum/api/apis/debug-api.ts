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

import globalAxios, { AxiosResponse, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from '../base';
import { GetDebugChainHeadsResponse } from '../models';
import { GetForkChoiceResponse } from '../models';
import { GetStateV2Response } from '../models';
import { InlineResponse404 } from '../models';
/**
 * DebugApi - axios parameter creator
 * @export
 */
export const DebugApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Retrieves all possible chain heads (leaves of fork choice tree).
         * @summary Get fork choice leaves
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getDebugChainHeadsV2: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/eth/v2/debug/beacon/heads`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
        /**
         * Retrieves all current fork choice context.
         * @summary Get fork choice array
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getDebugForkChoice: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/eth/v1/debug/fork_choice`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
        /**
         * Returns full BeaconState object for given stateId. Depending on `Accept` header it can be returned either as json or as bytes serialized by SSZ 
         * @summary Get full BeaconState object
         * @param {any} stateId State identifier. Can be one of: \&quot;head\&quot; (canonical head in node&#x27;s view), \&quot;genesis\&quot;, \&quot;finalized\&quot;, \&quot;justified\&quot;, \\&lt;slot\\&gt;, \\&lt;hex encoded stateRoot with 0x prefix\\&gt;. 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getStateV2: async (stateId: any, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'stateId' is not null or undefined
            if (stateId === null || stateId === undefined) {
                throw new RequiredError('stateId','Required parameter stateId was null or undefined when calling getStateV2.');
            }
            const localVarPath = `/eth/v2/debug/beacon/states/{state_id}`
                .replace(`{${"state_id"}}`, encodeURIComponent(String(stateId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * DebugApi - functional programming interface
 * @export
 */
export const DebugApiFp = function(configuration?: Configuration) {
    return {
        /**
         * Retrieves all possible chain heads (leaves of fork choice tree).
         * @summary Get fork choice leaves
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getDebugChainHeadsV2(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<GetDebugChainHeadsResponse>>> {
            const localVarAxiosArgs = await DebugApiAxiosParamCreator(configuration).getDebugChainHeadsV2(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Retrieves all current fork choice context.
         * @summary Get fork choice array
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getDebugForkChoice(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<GetForkChoiceResponse>>> {
            const localVarAxiosArgs = await DebugApiAxiosParamCreator(configuration).getDebugForkChoice(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Returns full BeaconState object for given stateId. Depending on `Accept` header it can be returned either as json or as bytes serialized by SSZ 
         * @summary Get full BeaconState object
         * @param {any} stateId State identifier. Can be one of: \&quot;head\&quot; (canonical head in node&#x27;s view), \&quot;genesis\&quot;, \&quot;finalized\&quot;, \&quot;justified\&quot;, \\&lt;slot\\&gt;, \\&lt;hex encoded stateRoot with 0x prefix\\&gt;. 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getStateV2(stateId: any, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<GetStateV2Response>>> {
            const localVarAxiosArgs = await DebugApiAxiosParamCreator(configuration).getStateV2(stateId, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * DebugApi - factory interface
 * @export
 */
export const DebugApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * Retrieves all possible chain heads (leaves of fork choice tree).
         * @summary Get fork choice leaves
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getDebugChainHeadsV2(options?: AxiosRequestConfig): Promise<AxiosResponse<GetDebugChainHeadsResponse>> {
            return DebugApiFp(configuration).getDebugChainHeadsV2(options).then((request) => request(axios, basePath));
        },
        /**
         * Retrieves all current fork choice context.
         * @summary Get fork choice array
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getDebugForkChoice(options?: AxiosRequestConfig): Promise<AxiosResponse<GetForkChoiceResponse>> {
            return DebugApiFp(configuration).getDebugForkChoice(options).then((request) => request(axios, basePath));
        },
        /**
         * Returns full BeaconState object for given stateId. Depending on `Accept` header it can be returned either as json or as bytes serialized by SSZ 
         * @summary Get full BeaconState object
         * @param {any} stateId State identifier. Can be one of: \&quot;head\&quot; (canonical head in node&#x27;s view), \&quot;genesis\&quot;, \&quot;finalized\&quot;, \&quot;justified\&quot;, \\&lt;slot\\&gt;, \\&lt;hex encoded stateRoot with 0x prefix\\&gt;. 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getStateV2(stateId: any, options?: AxiosRequestConfig): Promise<AxiosResponse<GetStateV2Response>> {
            return DebugApiFp(configuration).getStateV2(stateId, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * DebugApi - object-oriented interface
 * @export
 * @class DebugApi
 * @extends {BaseAPI}
 */
export class DebugApi extends BaseAPI {
    /**
     * Retrieves all possible chain heads (leaves of fork choice tree).
     * @summary Get fork choice leaves
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebugApi
     */
    public async getDebugChainHeadsV2(options?: AxiosRequestConfig) : Promise<AxiosResponse<GetDebugChainHeadsResponse>> {
        return DebugApiFp(this.configuration).getDebugChainHeadsV2(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     * Retrieves all current fork choice context.
     * @summary Get fork choice array
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebugApi
     */
    public async getDebugForkChoice(options?: AxiosRequestConfig) : Promise<AxiosResponse<GetForkChoiceResponse>> {
        return DebugApiFp(this.configuration).getDebugForkChoice(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     * Returns full BeaconState object for given stateId. Depending on `Accept` header it can be returned either as json or as bytes serialized by SSZ 
     * @summary Get full BeaconState object
     * @param {any} stateId State identifier. Can be one of: \&quot;head\&quot; (canonical head in node&#x27;s view), \&quot;genesis\&quot;, \&quot;finalized\&quot;, \&quot;justified\&quot;, \\&lt;slot\\&gt;, \\&lt;hex encoded stateRoot with 0x prefix\\&gt;. 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebugApi
     */
    public async getStateV2(stateId: any, options?: AxiosRequestConfig) : Promise<AxiosResponse<GetStateV2Response>> {
        return DebugApiFp(this.configuration).getStateV2(stateId, options).then((request) => request(this.axios, this.basePath));
    }
}