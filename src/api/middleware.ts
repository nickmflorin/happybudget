import { AxiosError, AxiosRequestConfig } from "axios";
import { isNil } from "lodash";

import * as errors from "./errors";
import * as parsers from "./parsers";
import * as util from "./util";

export const HttpHeaderRequestMiddleware = (config: AxiosRequestConfig): AxiosRequestConfig => {
  config = config || {};
  config.headers = { ...config.headers, ...util.getRequestHeaders() };
  return config;
};

export const HttpErrorResponseMiddlware =
  (forceLogout = true) =>
  (error: AxiosError<Http.ErrorResponse>) => {
    /* I don't fully understand why, because if this is the case then the Axios
       type bindings are wrong, but occassionally error.request will not be
       defined. */
    const url = !isNil(error.request) && !isNil(error.request.config) ? error.request.config.url : undefined;
    if (!isNil(error.response)) {
      const err = parsers.parseErrorFromResponse(error.response, forceLogout);
      if (err === null) {
        // If this happens, then there is something wrong with the parsers.
        throw new Error(
          "Inconsistent response handling - Axios indicated a request error but it was not detected by parsers."
        );
      }
      throw err;
    } else if (!isNil(error.request)) {
      throw new errors.NetworkError({ url });
    } else {
      throw error;
    }
  };
