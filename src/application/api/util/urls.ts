import urlModule from "url";

import { logger } from "internal";

import * as types from "../types";

/**
 * Parses the query parameters from the provided URL and returns the query parameters as an object.
 *
 * @param {string} url The URL that the query parameters should be parsed from.
 *
 * @returns {Record<string, string>}
 * 	 An object that represents the parameter names and values that are in the URL.
 */
export const getQueryParams = (url: string): Map<string, types.QueryParamValue> => {
  const queryString = urlModule.parse(url).query;
  const params = new Map<string, types.QueryParamValue>();
  if (queryString) {
    new URLSearchParams(queryString).forEach((v: string, k: string) => params.set(k, v));
  }
  return params;
};

export const getUrlPathParams = <U extends string>(value: U): types.UrlPathParams<U> => {
  const REGEX = /\/:([a-zA-Z]+[a-zA-Z0-9]?)/g;
  return Array.from(value.matchAll(REGEX)).map(
    (i: RegExpMatchArray) => i[1],
  ) as types.UrlPathParams<U>;
};

export const injectUrlPathParams = <U extends string, O extends types.UrlPathParamsObj<U>>(
  url: U,
  params: O,
): types.UrlWithPathParams<U, O> => {
  const paramNames = getUrlPathParams(url);
  paramNames.forEach((p: types.UrlPathParams<U, []>[number]) => {
    if (!url.includes(`:${p}`)) {
      throw new Error(`Expected the url ${url} to contain a path parameter ${p} but it does not!`);
    }
    url = url.replace(`:${p}`, `${params[p]}`) as U;
  });
  return url as types.UrlWithPathParams<U, O>;
};

export const processRawQueryParams = (query: types.RawQuery = {}): types.ProcessedQuery =>
  Object.keys(query).reduce((prev: types.ProcessedQuery, key: string): types.ProcessedQuery => {
    const value = query[key];
    // Automatically exclude null or undefined values from the query string.
    if (value !== null && value !== undefined) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        if (typeof value === "string" && value.trim() === "") {
          return prev;
        }
        return { ...prev, [key]: value };
      } else if (types.queryParamIsOrdering(value)) {
        return { ...prev, [key]: convertOrderingQueryToString(value) };
      }
      logger.warn(
        { value: String(value) },
        `Invalid value ${String(value)} provided as a query parameter to URL.`,
      );
      return prev;
    }
    return prev;
  }, {});

/**
 * Adds the provided query parameters to the provided URL or path, overwriting existing query
 * parameters that may already exist on the provided URL or path.
 *
 * @template U The type of the URL or path.
 *
 * @param {U} url
 *   The URL or path that the query parameters should be added to.
 *
 * @param {RawQuery} query The query parameters that should be added to the URL or path.
 *
 * @returns {U} The URL or path with the query parameters added.
 */
export const addQueryParamsToUrl = <
  Q extends types.RawQuery = types.RawQuery,
  U extends string = string,
>(
  url: U,
  query: Partial<Q> | undefined = {},
): U => {
  const urlParams = new URLSearchParams();
  const q: types.ProcessedQuery = processRawQueryParams(query);

  Object.keys(q).forEach((k: string) => {
    const v = q[k];
    if (v !== null && v !== undefined && (typeof v !== "string" || v.trim() !== "")) {
      urlParams.append(k, encodeURIComponent(v));
    }
  });
  if (urlParams.toString() !== "") {
    return (url.split("?")[0] + "?" + urlParams.toString()) as U;
  }
  return url;
};

export const removeLeadingSlashes = <T extends string>(value: T): types.LeadingSlash<T, false> => {
  let newValue = value;
  while (newValue.length > 0 && newValue.startsWith("/")) {
    newValue = newValue.slice(1) as T;
  }
  return newValue as types.LeadingSlash<T, false>;
};

export const removeTrailingSlashes = <T extends string>(
  value: T,
): types.TrailingSlash<T, false> => {
  let newValue = value;
  while (newValue.length > 0 && newValue.endsWith("/")) {
    newValue = newValue.slice(0, -1) as T;
  }
  return newValue as types.TrailingSlash<T, false>;
};

export const constructPath = <O extends types.HttpPathOptions>(options: O): types.HttpPath<O> =>
  options.basePath !== undefined
    ? (`${removeTrailingSlashes(options.basePath)}/${removeLeadingSlashes(
        options.path,
      )}` as types.HttpPath<O>)
    : (`/${removeLeadingSlashes(options.path)}` as types.HttpPath<O>);

type ConstructPathUrlOptions = types.HttpPathOptions & {
  readonly query?: types.RawQuery;
};

export const constructPathUrl = <O extends ConstructPathUrlOptions>(
  options: O,
): types.HttpPathUrl<O> =>
  addQueryParamsToUrl(constructPath(options), options.query) as types.HttpPathUrl<O>;

export const constructUri = <O extends types.HttpUriOptions>(options: O): types.HttpUri<O> =>
  `${options.scheme}://${options.host}${
    options.port !== undefined ? `:${options.port}` : ""
  }` as types.HttpUri<O>;

type ConstructUrlOptions = types.HttpUriOptions &
  types.HttpPathOptions & {
    readonly query?: types.RawQuery;
  };

export const constructUrl = <O extends ConstructUrlOptions>(options: O): types.HttpUrl<O> =>
  addQueryParamsToUrl(
    `${constructUri(options)}${constructPath(options)}`,
    options.query,
  ) as types.HttpUrl<O>;

const isConstructUriOptions = (
  options: ConstructPathUrlOptions | ConstructUrlOptions,
): options is ConstructUrlOptions =>
  (options as ConstructUrlOptions).host !== undefined &&
  (options as ConstructUrlOptions).scheme !== undefined;

export const constructEndpoint = <O extends ConstructPathUrlOptions | ConstructUrlOptions>(
  options: O,
): O extends ConstructUrlOptions ? types.HttpUrl<O> : types.HttpPathUrl<O> => {
  if (isConstructUriOptions(options)) {
    return constructUrl(options) as O extends ConstructUrlOptions
      ? types.HttpUrl<O>
      : types.HttpPathUrl<O>;
  }
  return constructPathUrl(options) as O extends ConstructUrlOptions
    ? types.HttpUrl<O>
    : types.HttpPathUrl<O>;
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
