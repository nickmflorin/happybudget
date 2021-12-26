import { AxiosResponse } from "axios";
import { isNil, map } from "lodash";
import * as codes from "./codes";
import * as util from "./util";

export enum HttpErrorTypes {
  CLIENT = "CLIENT",
  NETWORK = "NETWORK",
  SERVER = "SERVER",
  AUTHENTICATION = "AUTHENTICATION"
}

export enum ApiErrorTypes {
  AUTH = "auth",
  UNKNOWN = "unknown",
  HTTP = "http",
  FIELD = "field",
  GLOBAL = "global"
}

/**
 * When an exception returned by the backend indicates that we need to force
 * logout the user, the Axios interceptors will redirect to the login URL.
 * However, the mechanics making the API request are still expecting a response
 * or an Error to be raised, so we raise this Error to indicate that the caller
 * should fail silently and allow the redirect to occur.
 *
 * Note: This is less of a user-facing problem and more of a problem with
 * misleading errors flooding Sentry due to responses not being fully defined
 * when they are expected to be.
 */
export class ForceLogout extends Error {
  constructor(message: string, name?: string) {
    super("");
    this.message = message;
    this.name = name || "ForceLogout";
  }
}

/**
 * Base class for all request errors.  Should not be used directly, but rather
 * one of ClientError or NetworkError or ServerError should be used.
 */
export class HttpError extends Error {
  constructor(message: string, name?: string) {
    super("");
    this.message = message;
    this.name = name || "HttpError";
  }
}

const stringifyErrors = (errors: Http.Error[]): string => {
  if (errors.length === 0) {
    return "";
  } else if (errors.length === 1) {
    return errors[0].message;
  } else {
    const errorStrings: string[] = map(errors, (e: Http.Error, index: number) => `${index + 1}. ${e.message}`);
    return "\n" + errorStrings.join("\n");
  }
};

/**
 * A ClientError refers to an HTTP request error where there is a response
 * and the response status code is between 400 and 499.  In this case, Django
 * REST Framework will include an error in the response body.
 *
 * If the errors are related to validation of the fields of the serializer,
 * the response will be of the form:
 *
 * {
 *   errors: {
 *     field_1: [{message: ..., code: ...}, {message: ..., code: ...}],
 *     field_2: [{message: ..., code: ...}, {message: ..., code: ...}]
 *     ...
 *   }
 * }
 *
 * The object { message: ..., code: ... } is referred to as the error detail.
 *
 * If the errors are not related to the validation of specific fields but are
 * general, the response will be of the form:
 *
 * {
 *   errors: {
 *     __all__: [{message: ..., code: ...}],
 *   }
 * }
 *
 * 99.9% of the time, errors["__all__"] will only contain 1 detail, where as
 * the errors for individual fields have the potential to contain more than 1
 * detail.
 */
export class ClientError extends HttpError implements Http.IHttpClientError {
  public static type = HttpErrorTypes.CLIENT;
  public status: number;
  public url: string;
  public response: AxiosResponse<Http.ErrorResponse>;
  public errors: Http.Error[];
  public userId: number | undefined;

  constructor(
    config: Omit<
      Http.IHttpClientError,
      "message" | "name" | "authenticationError" | "httpError" | "fieldErrors" | "globalError" | "unknownError"
    >
  ) {
    super(
      `[${config.status}] There was an error making a request to ${config.url}: ${stringifyErrors(config.errors)}`,
      "ClientError"
    );
    this.userId = config.userId;
    this.url = config.url;
    this.response = config.response;
    this.status = config.status;
    this.errors = map(config.errors, (e: Http.Error) => codes.standardizeError(e));
  }

  public get authenticationError(): Http.AuthError | null {
    return util.parseAuthError(this);
  }

  public get httpError(): Http.HttpError | null {
    return util.parseHttpError(this);
  }

  public get fieldErrors(): Http.FieldError[] {
    return util.parseFieldErrors(this);
  }

  public get globalError(): Http.GlobalError | null {
    return util.parseGlobalError(this);
  }

  public get unknownError(): Http.UnknownError | null {
    return util.parseUnknownError(this);
  }
}

/**
 * A Server refers to a HTTP request error where there is a response
 * but the response status code is >= 500.  This can occur due to Internal
 * Server Errors.
 */
export class ServerError extends HttpError implements Http.IHttpServerError {
  public static type = HttpErrorTypes.SERVER;
  public url?: string;
  public status: number;

  constructor(config: Omit<Http.IHttpServerError, "message" | "name">) {
    super(
      !isNil(config.url)
        ? `There was a ${config.status} server error making a request to ${config.url}.`
        : `There was a ${config.status} server error making a request.`,
      "ServerError"
    );
    this.url = config.url;
    this.status = config.status;
  }
}

/**
 * A NetworkError refers to a HTTP request error where there is no response.
 * This can occur when the server is down or there are connectivity issues.
 */
export class NetworkError extends HttpError implements Http.IHttpNetworkError {
  public static type = HttpErrorTypes.NETWORK;
  public url?: string | undefined;

  constructor(config?: Omit<Http.IHttpNetworkError, "message" | "name">) {
    super(
      !isNil(config?.url)
        ? `There was a network error making a request to ${config?.url}.`
        : "There was a network error.",
      "NetworkError"
    );
    this.url = config?.url;
  }
}
