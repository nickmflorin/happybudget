import { ReactNode } from "react";

import { SWRConfig as RootSWRConfig } from "swr";
import { PublicConfiguration } from "swr/_internal";
import { z } from "zod";

import { errors } from "application";
import { logger } from "internal";

const SWR_CONFIG_SCHEMA = z
  .object({
    errorRetryInterval: z.preprocess(a => parseInt(z.string().parse(a)), z.number().positive()),
    errorRetryCount: z.preprocess(a => parseInt(z.string().parse(a)), z.number().positive()),
    dedupingInterval: z.preprocess(a => parseInt(z.string().parse(a)), z.number().positive()),
    revalidateOnReconnect: z.preprocess(
      a => (typeof a === "string" ? a.toLowerCase() === "true" : true),
      z.boolean().default(true),
    ),
    revalidateOnMount: z.preprocess(
      a => (typeof a === "string" ? a.toLowerCase() === "true" : true),
      z.boolean().default(true),
    ),
    revalidateOnFocus: z.preprocess(
      a => (typeof a === "string" ? a.toLowerCase() === "true" : false),
      z.boolean().default(false),
    ),
    keepPreviousData: z.preprocess(
      a => (typeof a === "string" ? a.toLowerCase() === "true" : true),
      z.boolean().default(true),
    ),
  })
  .strict();

type Configuration = Partial<Omit<PublicConfiguration, "shouldRetryOnError" | "onError">>;

export const getSwrConfig = (): Configuration => {
  const config = SWR_CONFIG_SCHEMA.safeParse({
    revalidateOnFocus: process.env.NEXT_PUBLIC_SWR_REVALIDATE_ON_FOCUS,
    revalidateOnMount: process.env.NEXT_PUBLIC_SWR_REVALIDATE_ON_MOUNT,
    revalidateOnReconnect: process.env.NEXT_PUBLIC_SWR_REVALIDATE_ON_RECONNECT,
    keepPreviousData: process.env.NEXT_PUBLIC_SWR_KEEP_PREVIOUS_DATA,
    dedupingInterval: process.env.NEXT_PUBLIC_SWR_DEDUPING_INTERVAL,
    errorRetryCount: process.env.NEXT_PUBLIC_SWR_ERROR_RETRY_COUNT,
    errorRetryInterval: process.env.NEXT_PUBLIC_SWR_ERROR_RETRY_INTERVAL,
  });
  if (config.success) {
    return config.data;
  }
  throw new Error("Invalid SWR configuration!");
};

type SWRConfigProps = { readonly children: ReactNode };

export const shouldRetryOnError = (
  e: Error | errors.ApiGlobalError | errors.NetworkError | unknown,
) => {
  const RETRY_ON_ERROR = process.env.NEXT_PUBLIC_SWR_RETRY_ON_ERROR;
  const RETRY_ON_NETWORK_ERROR = process.env.NEXT_PUBLIC_SWR_RETRY_ON_NETWORK_ERROR;

  const retryOnError =
    RETRY_ON_ERROR === undefined ? false : RETRY_ON_ERROR.toLowerCase() === "true";

  const retryOnNetworkError =
    RETRY_ON_NETWORK_ERROR === undefined ? false : RETRY_ON_NETWORK_ERROR.toLowerCase() === "true";

  if (!(e instanceof Error)) {
    logger.error(`The SWR fetcher unexpectedly returned a non-Error object: ${JSON.stringify(e)}!`);
    return false;
  } else if (retryOnError === false) {
    return false;
  } else if (errors.isNetworkError(e) && retryOnNetworkError !== true) {
    return false;
  } else if (errors.isApiGlobalError(e) || errors.isApiFieldError(e)) {
    /* Since API Global Error(s) and API Field Error(s) are always intentionally returned, they
       should never be retried. */
    return false;
  }
  return true;
};

/**
 * Establishes global configuration for Vercel's {@link useSWR} hook in the context of this
 * application that are intended to integrate with the client, {@link HttpClient}, in a way that the
 * type safety of errors can be guaranteed and the client, {@link HttpClient}, is used in a manner
 * that is consistent with the requirements of Vercel's {@link useSWR} hook.
 *
 * In order for the {@link useSWR} hook to be tied together with the {@link HttpClient}, the
 * configuration defined by this component must be in the global context and the component must use
 * a variation of the {@link useFetch} internal hook instead of Vercel's {@link useSWR} hook.
 *
 * See https://swr.vercel.app/
 *
 * Important configuration related properties are as follows:
 *
 * Error Handling
 * -------------
 * Using an appropriate `onError` callback, the type safety of errors that may surface during a
 * request can be guaranteed, ensuring that the errors that are returned from the hook are in fact
 * instances of an HTTP request error {@link errors.HttpError}, and other errors are not
 * incidentally suppressed.
 *
 * The {@link HttpClient} is only able to enforce strongly typed errors of type
 * {@link errors.HttpError} because the mechanics of the class are written to ensure that any error
 * that is returned is of type {@link errors.HttpError}:
 *
 * >>> const { response, error } = client.get("...")
 * >>> error // http.HttpError | undefined
 *
 * This means that when this error is thrown by the client, it will be included in the return of the
 * {@link useSWR} hook (and by relation, the {@link useFetch} hook).  However, if an error is thrown
 * in the logic between the usage of the hook and the method on the {@link HttpClient}, type safety
 * of errors cannot be guaranteed unless all non-HttpError objects are thrown in useSWR.
 *
 * ~~~~~
 * When using the {@link useFetch} internal hook (a wrapper around Vercel's {@link useSWR}), the
 * hook will always ensure that the globally configured `onError` callback is called even if a
 * custom callback is provided.
 */
export const SWRConfig = ({ children }: SWRConfigProps) => (
  <RootSWRConfig
    value={{
      onError: (e: unknown) => {
        /* It is necessary that any non-HttpError(s) are caught and thrown such that the behavior
           of the HttpClient related to strongly typed errors is preserved. */
        if (!(e instanceof Error)) {
          throw new Error(`Client unexpectedly returned non-Error object ${e}`);
        } else if (!errors.isHttpError(e)) {
          throw e;
        } else if (errors.isApiFieldError(e)) {
          /* Field level errors are only applicable for data submission, and there are mechanics
             responsible for providing feedback to users when an error fetching data occurs that
             require that the error is not a field level error. */
          throw new Error("Client unexpectedly returned field level error for GET request.");
        }
      },
      shouldRetryOnError,
      ...getSwrConfig(),
    }}
  >
    {children}
  </RootSWRConfig>
);
