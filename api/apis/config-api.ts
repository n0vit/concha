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
import { GetDepositContractResponse } from '../models';
import { GetForkScheduleResponse } from '../models';
import { GetSpecResponse } from '../models';
import { InlineResponse404 } from '../models';
/**
 * ConfigApi - axios parameter creator
 * @export
 */
export const ConfigApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Retrieve Eth1 deposit contract address and chain ID.
         * @summary Get deposit contract address.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getDepositContract: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/eth/v1/config/deposit_contract`;
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
         * Retrieve all forks, past present and future, of which this node is aware.
         * @summary Get scheduled upcoming forks.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getForkSchedule: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/eth/v1/config/fork_schedule`;
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
         * Retrieve specification configuration used on this node.  The configuration should include:   - Constants for all hard forks known by the beacon node, for example the [phase 0](https://github.com/ethereum/consensus-specs/blob/v1.3.0/specs/phase0/beacon-chain.md#constants) and [altair](https://github.com/ethereum/consensus-specs/blob/v1.3.0/specs/altair/beacon-chain.md#constants) values   - Presets for all hard forks supplied to the beacon node, for example the [phase 0](https://github.com/ethereum/consensus-specs/blob/v1.3.0/presets/mainnet/phase0.yaml) and [altair](https://github.com/ethereum/consensus-specs/blob/v1.3.0/presets/mainnet/altair.yaml) values   - Configuration for the beacon node, for example the [mainnet](https://github.com/ethereum/consensus-specs/blob/v1.3.0/configs/mainnet.yaml) values  Values are returned with following format:   - any value starting with 0x in the spec is returned as a hex string   - numeric values are returned as a quoted integer 
         * @summary Get spec params.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSpec: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/eth/v1/config/spec`;
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
 * ConfigApi - functional programming interface
 * @export
 */
export const ConfigApiFp = function(configuration?: Configuration) {
    return {
        /**
         * Retrieve Eth1 deposit contract address and chain ID.
         * @summary Get deposit contract address.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getDepositContract(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<GetDepositContractResponse>>> {
            const localVarAxiosArgs = await ConfigApiAxiosParamCreator(configuration).getDepositContract(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Retrieve all forks, past present and future, of which this node is aware.
         * @summary Get scheduled upcoming forks.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getForkSchedule(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<GetForkScheduleResponse>>> {
            const localVarAxiosArgs = await ConfigApiAxiosParamCreator(configuration).getForkSchedule(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Retrieve specification configuration used on this node.  The configuration should include:   - Constants for all hard forks known by the beacon node, for example the [phase 0](https://github.com/ethereum/consensus-specs/blob/v1.3.0/specs/phase0/beacon-chain.md#constants) and [altair](https://github.com/ethereum/consensus-specs/blob/v1.3.0/specs/altair/beacon-chain.md#constants) values   - Presets for all hard forks supplied to the beacon node, for example the [phase 0](https://github.com/ethereum/consensus-specs/blob/v1.3.0/presets/mainnet/phase0.yaml) and [altair](https://github.com/ethereum/consensus-specs/blob/v1.3.0/presets/mainnet/altair.yaml) values   - Configuration for the beacon node, for example the [mainnet](https://github.com/ethereum/consensus-specs/blob/v1.3.0/configs/mainnet.yaml) values  Values are returned with following format:   - any value starting with 0x in the spec is returned as a hex string   - numeric values are returned as a quoted integer 
         * @summary Get spec params.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getSpec(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<GetSpecResponse>>> {
            const localVarAxiosArgs = await ConfigApiAxiosParamCreator(configuration).getSpec(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * ConfigApi - factory interface
 * @export
 */
export const ConfigApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * Retrieve Eth1 deposit contract address and chain ID.
         * @summary Get deposit contract address.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getDepositContract(options?: AxiosRequestConfig): Promise<AxiosResponse<GetDepositContractResponse>> {
            return ConfigApiFp(configuration).getDepositContract(options).then((request) => request(axios, basePath));
        },
        /**
         * Retrieve all forks, past present and future, of which this node is aware.
         * @summary Get scheduled upcoming forks.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getForkSchedule(options?: AxiosRequestConfig): Promise<AxiosResponse<GetForkScheduleResponse>> {
            return ConfigApiFp(configuration).getForkSchedule(options).then((request) => request(axios, basePath));
        },
        /**
         * Retrieve specification configuration used on this node.  The configuration should include:   - Constants for all hard forks known by the beacon node, for example the [phase 0](https://github.com/ethereum/consensus-specs/blob/v1.3.0/specs/phase0/beacon-chain.md#constants) and [altair](https://github.com/ethereum/consensus-specs/blob/v1.3.0/specs/altair/beacon-chain.md#constants) values   - Presets for all hard forks supplied to the beacon node, for example the [phase 0](https://github.com/ethereum/consensus-specs/blob/v1.3.0/presets/mainnet/phase0.yaml) and [altair](https://github.com/ethereum/consensus-specs/blob/v1.3.0/presets/mainnet/altair.yaml) values   - Configuration for the beacon node, for example the [mainnet](https://github.com/ethereum/consensus-specs/blob/v1.3.0/configs/mainnet.yaml) values  Values are returned with following format:   - any value starting with 0x in the spec is returned as a hex string   - numeric values are returned as a quoted integer 
         * @summary Get spec params.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getSpec(options?: AxiosRequestConfig): Promise<AxiosResponse<GetSpecResponse>> {
            return ConfigApiFp(configuration).getSpec(options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * ConfigApi - object-oriented interface
 * @export
 * @class ConfigApi
 * @extends {BaseAPI}
 */
export class ConfigApi extends BaseAPI {
    /**
     * Retrieve Eth1 deposit contract address and chain ID.
     * @summary Get deposit contract address.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConfigApi
     */
    public async getDepositContract(options?: AxiosRequestConfig) : Promise<AxiosResponse<GetDepositContractResponse>> {
        return ConfigApiFp(this.configuration).getDepositContract(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     * Retrieve all forks, past present and future, of which this node is aware.
     * @summary Get scheduled upcoming forks.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConfigApi
     */
    public async getForkSchedule(options?: AxiosRequestConfig) : Promise<AxiosResponse<GetForkScheduleResponse>> {
        return ConfigApiFp(this.configuration).getForkSchedule(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     * Retrieve specification configuration used on this node.  The configuration should include:   - Constants for all hard forks known by the beacon node, for example the [phase 0](https://github.com/ethereum/consensus-specs/blob/v1.3.0/specs/phase0/beacon-chain.md#constants) and [altair](https://github.com/ethereum/consensus-specs/blob/v1.3.0/specs/altair/beacon-chain.md#constants) values   - Presets for all hard forks supplied to the beacon node, for example the [phase 0](https://github.com/ethereum/consensus-specs/blob/v1.3.0/presets/mainnet/phase0.yaml) and [altair](https://github.com/ethereum/consensus-specs/blob/v1.3.0/presets/mainnet/altair.yaml) values   - Configuration for the beacon node, for example the [mainnet](https://github.com/ethereum/consensus-specs/blob/v1.3.0/configs/mainnet.yaml) values  Values are returned with following format:   - any value starting with 0x in the spec is returned as a hex string   - numeric values are returned as a quoted integer 
     * @summary Get spec params.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConfigApi
     */
    public async getSpec(options?: AxiosRequestConfig) : Promise<AxiosResponse<GetSpecResponse>> {
        return ConfigApiFp(this.configuration).getSpec(options).then((request) => request(this.axios, this.basePath));
    }
}