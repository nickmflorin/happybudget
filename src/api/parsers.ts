import { AxiosResponse } from "axios";
import { isNil, reduce } from "lodash";

import { notifications } from "lib";

import * as codes from "./codes";
import * as errors from "./errors";
import * as typeguards from "./typeguards";

/* The majority of the time, our requests funnel through one of the ApiClient
   instances - which means that when an error occurs, the response will be an
	 AxiosResponse instance with the ErrorResponse body.  However, there are cases
	 (XHR requests) where we bypass the ApiClient instances, and thus axios,
	 entirely - in which case the response will not be an AxiosResponse instance.
	 For this reason, we define more general response structures that contain the
	 information necessary to properly handle potential request errors.
	 */
type ExplicitErrorResponseInfo = {
  readonly url: string;
  readonly status: number;
};

type ErrorResponseInfo = AxiosResponse | ExplicitErrorResponseInfo;

type ExplicitClientErrorResponseInfo = ExplicitErrorResponseInfo & {
  readonly data: Http.ErrorResponse;
};

type ClientErrorResponseInfo = AxiosResponse<Http.ErrorResponse> | ExplicitClientErrorResponseInfo;

const isAxiosResponse = <E extends AxiosResponse | AxiosResponse<Http.ErrorResponse>>(
  e: ErrorResponseInfo | ClientErrorResponseInfo
): e is E => (e as E).config !== undefined;

const responseUrl = (e: ErrorResponseInfo): string => (isAxiosResponse(e) ? e.config.url || "" : e.url);

const explicitResponse = (r: ErrorResponseInfo): ExplicitErrorResponseInfo => ({
  url: responseUrl(r),
  status: r.status
});

const warnInconsistentResponse = (response: ErrorResponseInfo, detail: string) =>
  notifications.internal.notify({
    level: "error",
    dispatchToSentry: true,
    message:
      `The [${response.status}] response body from the backend does not ` +
      "conform to a standard convention for indicating a client error. \n" +
      `Reason: ${detail}`
  });

type PartialErrorInfo = Omit<Partial<Http.IApiResponseError<Http.ResponseErrorType, Http.ErrorCode>>, "error_type">;

type ErrorDefault = (response: ErrorResponseInfo, info?: PartialErrorInfo | undefined) => errors.ClientError;

const errorDefaults: { [key: number]: ErrorDefault } = {
  404: (response: ErrorResponseInfo, info?: PartialErrorInfo | undefined) =>
    new errors.HttpError({
      ...explicitResponse(response),
      message: info?.message || "The requested resource could not be found.",
      code: (info?.code as Http.HttpErrorCode) || codes.ErrorCodes.http.NOT_FOUND
    }),
  405: (response: ErrorResponseInfo, info?: PartialErrorInfo | undefined) =>
    new errors.HttpError({
      ...explicitResponse(response),
      message: info?.message || "This method is not allowed.",
      code: (info?.code as Http.HttpErrorCode) || codes.ErrorCodes.http.METHOD_NOT_ALLOWED
    })
};

/**
 * Attempts to infer what ClientError should be raised based on the received
 * response and any potential corrupted response error data.
 *
 * This should only be used if the response body does not conform to the standard
 * error protocol. As such, a warning will be issued, and the specific ClientError
 * returned will be inferred from the response.
 *
 * In the case that the inference is not possible, an UnknownClientError will be
 * returned.
 */
const _inferUnknownError = (
  response: ErrorResponseInfo,
  detail: string,
  error?: PartialErrorInfo
): errors.ClientError => {
  warnInconsistentResponse(response, detail);
  if (!isNil(error) && isNil(error.message)) {
    warnInconsistentResponse(
      response,
      "Unexpectedly received response error without a message. Original " +
        `response error was: \n ${notifications.objToJson(error)}.`
    );
  }
  if (!isNil(error) && isNil(error.code)) {
    warnInconsistentResponse(
      response,
      "Unexpectedly received response error without a code. Original " +
        `response error was: \n ${notifications.objToJson(error)}.`
    );
  }
  const defaultHandler = errorDefaults[response.status];
  if (!isNil(defaultHandler)) {
    return defaultHandler(response, error);
  }
  return new errors.UnknownClientError(explicitResponse(response));
};

/**
 * Parses the error information embedded in the response in the case that there
 * are multiple errors, returning the appropriate FieldsError associated with
 * the errors.
 *
 * When there are multiple errors embedded in the response body, the error type
 * of each error should only ever be "field".  If we detect other error types in
 * the array, a warning will be issued.  If we detect other error types in the
 * array and there are no errors with type "field" in the array, an
 * UnknownClientError will be returned.
 */
const _parseMultipleResponseErrors = (response: ClientErrorResponseInfo) => {
  let nonFieldErrors: Http.ResponseErrorType[] = [];
  const fieldErrors: Http.ResponseFieldError[] = reduce(
    response.data.errors,
    (curr: Http.ResponseFieldError[], e: Http.ResponseError) => {
      if (typeguards.isResponseFieldError(e)) {
        return [...curr, e];
      } else {
        nonFieldErrors = [...nonFieldErrors, e.error_type];
        return curr;
      }
    },
    []
  );
  /* If there are non field errors in the array, it is unexpected.  We must
     determine whether or not we can raise a valid FieldsError from any present
     field errors in the array, but if there are none - we must return an
     UnknownClientError. */
  if (nonFieldErrors.length !== 0) {
    const stringified = nonFieldErrors.join(", ");
    warnInconsistentResponse(
      response,
      `Multiple errors embedded in response, but noticed invalid error type(s) ${stringified}.`
    );
    /* Only return an UnknownClientError in the case that a FieldsError cannot
       be constructed from any of the potential `field` type errors in the
			 array. */
    if (fieldErrors.length === 0) {
      return new errors.UnknownClientError(explicitResponse(response));
    }
  }
  return new errors.FieldsError({ errors: fieldErrors, ...explicitResponse(response) });
};

type Mapped = {
  field: errors.FieldsError;
  permission: errors.PermissionError;
  billing: errors.BillingError;
  http: errors.HttpError;
  bad_request: errors.BadRequestError;
  form: errors.FormError;
};

type ErrorMap<E extends Http.ResponseError> = {
  readonly typeguard: (e: Http.ResponseError | Http.UnknownResponseError) => e is E;
  readonly instantiate: (e: E, r: ClientErrorResponseInfo) => Mapped[E["error_type"] & keyof Mapped];
};

const Mapping = [
  {
    typeguard: typeguards.isResponseFieldError,
    instantiate: (e: Http.ResponseFieldError, r: ClientErrorResponseInfo) =>
      new errors.FieldsError({ errors: [e], ...explicitResponse(r) })
  },
  {
    typeguard: typeguards.isResponseAuthError,
    instantiate: (e: Http.ResponseAuthError, r: ClientErrorResponseInfo) =>
      new errors.AuthenticationError({ ...e, ...explicitResponse(r) })
  },
  {
    typeguard: typeguards.isResponseBillingError,
    instantiate: (e: Http.ResponseBillingError, r: ClientErrorResponseInfo) =>
      new errors.BillingError({ ...e, ...explicitResponse(r) })
  },
  {
    typeguard: typeguards.isResponseHttpError,
    instantiate: (e: Http.ResponseHttpError, r: ClientErrorResponseInfo) =>
      new errors.HttpError({ ...e, ...explicitResponse(r) })
  },
  {
    typeguard: typeguards.isResponseBadRequestError,
    instantiate: (e: Http.ResponseBadRequestError, r: ClientErrorResponseInfo) =>
      new errors.BadRequestError({ ...e, ...explicitResponse(r) })
  },
  {
    typeguard: typeguards.isResponseFormError,
    instantiate: (e: Http.ResponseFormError, r: ClientErrorResponseInfo) =>
      new errors.FormError({ ...e, ...explicitResponse(r) })
  },
  {
    typeguard: typeguards.isResponsePermissionError,
    instantiate: (e: Http.ResponsePermissionError, r: ClientErrorResponseInfo) =>
      new errors.PermissionError({ ...e, ...explicitResponse(r) })
  }
];

/**
 * Parses the error information embedded in the response in the case that there
 * is a single error, returning the appropriate ClientError instance determined
 * from the error type.
 */
const _parseSingleResponseError = (response: ClientErrorResponseInfo) => {
  const responseError = response.data.errors[0];
  for (let i = 0; i < Mapping.length; i++) {
    const mp = Mapping[i];
    if (mp.typeguard(responseError)) {
      return (mp as ErrorMap<typeof responseError>).instantiate(responseError, response);
    }
  }
  if (responseError.error_type !== undefined) {
    return _inferUnknownError(
      response,
      `Unexpectedly received response error with an error type ${responseError.error_type} that is unrecognized.`,
      responseError
    );
  }
  return _inferUnknownError(
    response,
    "Unexpectedly received response error without an error type. This most likely means " +
      "the backend exception handling protocols are being bypassed.  Original " +
      `response error was: \n ${notifications.objToJson(responseError)}.`,
    responseError
  );
};

const _parseClientErrorFromResponseBody = (response: ErrorResponseInfo, body?: Http.ErrorResponse) => {
  if (isNil(body)) {
    return _inferUnknownError(response, "The response body could not be parsed.");
  } else if (isNil(body.errors) || !Array.isArray(body.errors)) {
    return _inferUnknownError(response, "Unexpectedly received response body without any defined errors.");
  } else if (body.errors.length === 0) {
    return _inferUnknownError(response, "There are no errors in the response body.");
  } else if (body.errors.length !== 1) {
    return _parseMultipleResponseErrors({ ...response, data: body });
  } else {
    return _parseSingleResponseError({ ...response, data: body });
  }
};

const _parseClientError = (
  response: AxiosResponse<Http.ErrorResponse> | (ErrorResponseInfo & { readonly data: string })
) => {
  /* If the response is an AxiosResponse, then the information on the response
     body will already be parsed to JSON. */
  if (isAxiosResponse(response)) {
    return _parseClientErrorFromResponseBody(response, response.data);
  } else {
    try {
      return _parseClientErrorFromResponseBody(response, JSON.parse(response.data));
    } catch (err) {
      /* If the error response body could not be parsed to JSON, then the
         `parseClientErrorFromResponseBody` will return an UnknownClientError. */
      if (err instanceof SyntaxError) {
        return _parseClientErrorFromResponseBody(response);
      } else {
        throw err;
      }
    }
  }
};

/**
 * Parses the error information from the response embedded in a response and
 * returns an appropriate ClientError, ServerError, ForceLogout or NetworkError
 * in the case that there was a request error.  Otherwise, will return null in
 * the case that the response was successful.
 *
 * @param response       The AxiosResponse attached to the error or the explicit
 *                       ErrorResponseInfo object that contains details about the
 *                       response that are required for error handling.
 * @param forceLogout    Whether or not the user should be forcefully logged out
 *                       on a [401] response.
 */
export const parseErrorFromResponse = (
  response: AxiosResponse | (ErrorResponseInfo & { readonly data: string }),
  forceLogout = true
): Http.ApiError | errors.ForceLogout | null => {
  if (forceLogout === true && response.status == 401) {
    window.location.href = "/logout";
    /* We throw an error because the mechanics making the API request are
			 expecting a defined response or an Error to be thrown.  If we return
			 nothing, we may get misleading errors dispatched to Sentry that occur
			 between the time this method returns and the time the redirect actually
			 takes place. */
    return new errors.ForceLogout("User is not authenticated.");
  } else if (response.status >= 400 && response.status < 500) {
    return _parseClientError(response);
  } else if (!(response.status >= 200 && response.status < 300)) {
    return new errors.ServerError(explicitResponse(response));
  } else {
    return null;
  }
};
