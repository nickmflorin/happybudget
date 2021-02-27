import { forEach, isNil } from "lodash";
import urljoin from "url-join";

/**
 * Returns the React app domain from the environment variable
 * REACT_APP_DOMAIN.  Note that the REACT_APP_DOMAIN must NOT
 * contain a trailing slash.
 */
export const getDomain = (): string => {
  // If we don't check process.env.REACT_APP_DOMAIN for null/undefined, we can get
  // misleading errors.
  const domain = process.env.REACT_APP_DOMAIN;
  if (isNil(domain)) {
    throw new Error("The REACT_APP_DOMAIN environment variable is missing from the .env file.");
  }
  return domain;
};

/**
 * Takes a URL path as a single string or a series of arguments
 * and constructs a URL that is in the domain defined by the ENV
 * DOMAIN variable.
 *
 * @param parts A series of arguments that constructs the path of the
 * desired URL.
 *
 * Ex)
 *
 * relativizeUrlPath("admin", "users", "5")
 * >>> http://localhost:3000/admin/users/5
 */
export const relativizeUrlPath = (...parts: string[]): string => {
  let path: string = urljoin(...parts);
  // The first part in the array of PATH components should really start with
  // a leading slash, but just in case it doesn't we will safeguard against that.
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return `${getDomain()}${path}`;
};

/**
 * Parses the provided URL and returns the query parameters in the URL as
 * an object.
 * @param url The URL for which we want to get the query parameters from.
 */
export const getQueryParams = (url: string): { [key: string]: string } => {
  const queryParams: { [key: string]: string } = {};

  const anchor = document.createElement("a");
  anchor.href = url;

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

/**
 * Adds the provided query parameters to the URL, merging the existing query
 * parameters with the provided query parameters if applicable.
 *
 * @param url The URL for which we want to add the provided query parameters to.
 * The URL can already contain query parameters, and the provided query parameters
 * will be merged with the exiting ones.
 * @param object The query parameters to add to the URL as an object.
 */
export const addQueryParamsToUrl = (
  url: string,
  query: { [key: string]: unknown } = {},
  options: { filter?: any[] } = { filter: [] }
): string => {
  const existingQuery = getQueryParams(url);
  const newQuery = query || {};
  const mergedQuery = { ...existingQuery, ...newQuery };

  const urlParams = new URLSearchParams();
  forEach(mergedQuery, (value: unknown, key: string) => {
    if (!isNil(value) && (isNil(options.filter) || !options.filter.includes(value))) {
      urlParams.append(key, String(value));
    }
  });
  if (urlParams.toString() !== "") {
    return url.split("?")[0] + "?" + urlParams.toString();
  }
  return url;
};