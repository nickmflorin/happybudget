import { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";
import { isNil } from "lodash";

import { notifications } from "lib";

import * as codes from "./codes";
import * as errors from "./errors";
import * as util from "./util";

/**
 * Parses the error information from the response embedded in an AxiosError
 * and raises the appropriate ClientError.
 *
 * @param response       The AxiosResponse attached to the error.
 * @param status         The response status code on the original response, not
 *                       the `response` attribute of the AxiosError.  This is
 *                       used solely for logging purposes.
 * @param authenticated  Whether or not the AxiosInstance is being used in an
 *                       authenticated context.  In an authenticated context,
 *                       users are not force logged out.
 */
const throwClientError = (response: AxiosResponse<Http.ErrorResponse>, forceLogout = true) => {
  const url = !isNil(response.config.url) ? response.config.url : "";

  if (forceLogout === true && response.status == 401) {
    window.location.href = "/login";
    /* We throw an error because the mechanics making the API request are
			 expecting a defined response or an Error to be thrown.  If we to return
			 nothing, we may get misleading errors dispatched to Sentry that occur
			 between the time this method returns and the time the redirect actually
			 takes place. */
    throw new errors.ForceLogout("User is not authenticated.");
  } else {
    if (response.status === 404) {
      /* On 404's Django will sometimes bypass DRF exception handling and
         return a 404.html template response.  We should bypass this in the
         backend, but for the time being we can manually raise a ClientError. */
      throw new errors.ClientError({
        response,
        errors: [
          {
            message: "The requested resource could not be found.",
            code: codes.ErrorCodes.NOT_FOUND,
            error_type: errors.ApiErrorTypes.HTTP
          } as Http.Error
        ],
        status: response.status,
        url
      });
    } else if (!isNil(response.data.errors)) {
      throw new errors.ClientError({
        response,
        errors: response.data.errors,
        status: response.status,
        url
      });
    } else {
      notifications.notify({
        level: "error",
        dispatchToSentry: true,
        message: `
          The response body from the backend does not conform to a standard convention for indicating
          a client error - the specific type of error cannot be determined.
      `
      });
      throw new errors.ClientError({
        response,
        errors: [
          {
            message: "Unknown client error.",
            error_type: errors.ApiErrorTypes.UNKNOWN,
            code: codes.ErrorCodes.UNKNOWN
          } as Http.UnknownError
        ],
        status: response.status,
        url
      });
    }
  }
};

export const HttpHeaderRequestMiddleware = (config: AxiosRequestConfig): AxiosRequestConfig => {
  config = config || {};
  config.headers = { ...config.headers, ...util.getRequestHeaders() };
  return config;
};

export const HttpErrorResponseMiddlware =
  (forceLogout = true) =>
  (error: AxiosError<Http.ErrorResponse>) => {
    if (!isNil(error.response)) {
      const response = error.response;
      if (response.status >= 400 && response.status < 500) {
        throwClientError(response, forceLogout);
      } else {
        const url = !isNil(error.request.config) ? error.request.config.url : undefined;
        throw new errors.ServerError({ status: error.response.status, url });
      }
    } else if (!isNil(error.request)) {
      throw new errors.NetworkError({ url: !isNil(error.request.config) ? error.request.conf.url : undefined });
    } else {
      throw error;
    }
  };
