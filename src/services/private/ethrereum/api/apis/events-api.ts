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
import { InlineResponse404 } from '../models';
/**
 * EventsApi - axios parameter creator
 * @export
 */
export const EventsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Provides endpoint to subscribe to beacon node Server-Sent-Events stream. Consumers should use [eventsource](https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface) implementation to listen on those events.  Servers _may_ send SSE comments beginning with `:` for any purpose, including to keep the event stream connection alive in the presence of proxy servers. 
         * @summary Subscribe to beacon node events
         * @param {any} topics Event types to subscribe to
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        eventstream: async (topics: any, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'topics' is not null or undefined
            if (topics === null || topics === undefined) {
                throw new RequiredError('topics','Required parameter topics was null or undefined when calling eventstream.');
            }
            const localVarPath = `/eth/v1/events`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (topics !== undefined) {
                localVarQueryParameter['topics'] = topics;
            }

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
 * EventsApi - functional programming interface
 * @export
 */
export const EventsApiFp = function(configuration?: Configuration) {
    return {
        /**
         * Provides endpoint to subscribe to beacon node Server-Sent-Events stream. Consumers should use [eventsource](https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface) implementation to listen on those events.  Servers _may_ send SSE comments beginning with `:` for any purpose, including to keep the event stream connection alive in the presence of proxy servers. 
         * @summary Subscribe to beacon node events
         * @param {any} topics Event types to subscribe to
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async eventstream(topics: any, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<any>>> {
            const localVarAxiosArgs = await EventsApiAxiosParamCreator(configuration).eventstream(topics, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * EventsApi - factory interface
 * @export
 */
export const EventsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * Provides endpoint to subscribe to beacon node Server-Sent-Events stream. Consumers should use [eventsource](https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface) implementation to listen on those events.  Servers _may_ send SSE comments beginning with `:` for any purpose, including to keep the event stream connection alive in the presence of proxy servers. 
         * @summary Subscribe to beacon node events
         * @param {any} topics Event types to subscribe to
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async eventstream(topics: any, options?: AxiosRequestConfig): Promise<AxiosResponse<any>> {
            return EventsApiFp(configuration).eventstream(topics, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * EventsApi - object-oriented interface
 * @export
 * @class EventsApi
 * @extends {BaseAPI}
 */
export class EventsApi extends BaseAPI {
    /**
     * Provides endpoint to subscribe to beacon node Server-Sent-Events stream. Consumers should use [eventsource](https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface) implementation to listen on those events.  Servers _may_ send SSE comments beginning with `:` for any purpose, including to keep the event stream connection alive in the presence of proxy servers. 
     * @summary Subscribe to beacon node events
     * @param {any} topics Event types to subscribe to
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    public async eventstream(topics: any, options?: AxiosRequestConfig) : Promise<AxiosResponse<any>> {
        return EventsApiFp(this.configuration).eventstream(topics, options).then((request) => request(this.axios, this.basePath));
    }
}