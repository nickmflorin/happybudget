import { logger } from "internal";

import * as types from "../types";

/**
 * Parses the query parameters from the provided URL and returns the query parameters as an object.
 *
 * @param {string} url The URL for which we want to get the query parameters from.
 */
export const getQueryParams = (url: string): Record<string, string> => {
  const anchor = document.createElement("a");
  anchor.href = url;

  const queryParams: Record<string, string> = {};
  const queryStrings = anchor.search.substring(1);
  if (queryStrings !== "") {
    const params = queryStrings.split("&");
    for (let i = 0; i < params.length; i++) {
      const pair = params[i].split("=");
      queryParams[pair[0]] = decodeURIComponent(pair[1]);
    }
  }
  return queryParams;
};

type QueryParamsExclusion = types.QueryParamValue[] | ((v: types.QueryParamValue) => boolean);

type AddQueryParamsToUrlOptions = {
  readonly exclude: QueryParamsExclusion;
};

/**
 * Adds the provided query parameters to the provided URL, accounting for query parameters that may
 * already exist on the provided URL.  The provided query parameters will be merged with existing
 * query parameters on the URL (if they exist).
 *
 * @param {string} url
 *   The URL for which we want to add the provided query parameters to.  The URL can already contain
 *   query parameters, and the provided query parameters will be merged with the existing ones.
 *
 * @param {types.RawQuery} query  The query parameters to add to the URL as an object.
 *
 * @param {AddQueryParamsToUrlOptions} options
 *   Options that can be supplied to to the method.  This includes a `filter` option, which is
 *   responsible for removing query parameters (or not including them) if they meet the filter
 *   criteria.
 */
export const addQueryParamsToUrl = (
  url: string,
  query: types.RawQuery = {},
  options?: AddQueryParamsToUrlOptions,
): string => {
  const existingQuery = getQueryParams(url);
  const newQuery = query || {};
  const mergedQuery: types.RawQuery = { ...existingQuery, ...newQuery };

  const urlParams = new URLSearchParams();
  Object.keys(mergedQuery).forEach((key: string) => {
    const value = mergedQuery[key];
    // Automatically exclude null or undefined values from the query string.
    if (value !== null && value !== undefined) {
      /* Even though this is typed to always be the case, we perform a runtime
         check here and log if it fails. */
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        const exclusion: QueryParamsExclusion = options?.exclude || [];
        if (
          typeof exclusion === "function" ? exclusion(value) !== true : !exclusion.includes(value)
        ) {
          urlParams.append(key, encodeURIComponent(value));
        }
      } else {
        logger.warn(
          { value: String(value) },
          `Invalid value ${String(value)} provided as a query parameter to URL.`,
        );
      }
    }
  });
  if (urlParams.toString() !== "") {
    return url.split("?")[0] + "?" + urlParams.toString();
  }
  return url;
};

/**
 * Given an array representing the ordering of fields that should be applied to the GET request,
 * converts the object to a string so that it can be used as a query parameter.
 *
 * @param {types.Ordering} ordering
 *   The ordering object that should be converted to a query compatible string.  Each field in the
 *   object should have  value 1 or -1.
 */
export const convertOrderingQueryToString = <F extends string = string>(
  ordering: types.Ordering<F>,
): string => {
  const orderingStrings: string[] = ordering.reduce(
    (prev: string[], order: types.FieldOrder<F>) => {
      if (order.order === 1) {
        return [...prev, order.field];
      } else if (order.order === -1) {
        return [...prev, `-${order.field}`];
      }
      return prev;
    },
    [],
  );
  if (orderingStrings.length !== 0) {
    return orderingStrings.join(",");
  }
  return "";
};
