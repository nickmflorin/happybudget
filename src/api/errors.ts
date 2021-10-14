import { AxiosResponse } from "axios";
import { isNil, map } from "lodash";

/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
export enum HttpErrorTypes {
  CLIENT = "CLIENT",
  NETWORK = "NETWORK",
  SERVER = "SERVER",
  AUTHENTICATION = "AUTHENTICATION"
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
export class ClientError<E extends Http.Error = Http.Error> extends HttpError implements Http.IHttpClientError<E> {
  public static type = HttpErrorTypes.CLIENT;
  public status: number;
  public url: string;
  public response: AxiosResponse<Http.ErrorResponse>;
  public errors: E[];

  constructor(config: Omit<Http.IHttpClientError<E>, "message" | "name"> & { readonly name?: string }) {
    super(
      `[${config.status}] There was an error making a request to ${config.url}: ${stringifyErrors(config.errors)}`,
      config.name || "ClientError"
    );
    this.url = config.url;
    this.response = config.response;
    this.status = config.status;
    this.errors = config.errors;
  }
}

export class AuthenticationError extends ClientError<Http.AuthError> implements Http.IHttpAuthenticationError {
  public readonly forceLogout: boolean = false;

  constructor(config: Omit<Http.IHttpAuthenticationError, "message" | "name">) {
    super({ ...config, name: "AuthenticationError" });
    this.forceLogout = config.forceLogout || false;
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
