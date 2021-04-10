import { isNil } from "lodash";
import { AxiosResponse } from "axios";

/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
export enum HttpErrorTypes {
  CLIENT = "CLIENT",
  NETWORK = "NETWORK",
  SERVER = "SERVER",
  AUTHENTICATION = "AUTHENTICATION"
}

export interface IHttpNetworkError {
  readonly url?: string;
}

export interface IHttpServerError {
  readonly url?: string;
}

export interface IHttpClientError {
  readonly url: string;
  readonly status: number;
  readonly response: AxiosResponse<any>;
  readonly errors: any;
}

export interface IHttpAuthenticationError {
  readonly url: string;
  readonly response: AxiosResponse<any>;
  readonly errors: any;
}

export class ForceLogout extends Error {}

/**
 * Base class for all request errors.  Should not be used directly, but rather
 * one of ClientError or NetworkError or ServerError should be used.
 */
export class HttpError extends Error {}

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
export class ClientError extends HttpError implements IHttpClientError {
  public static type = HttpErrorTypes.CLIENT;
  public status: number;
  public url: string;
  public response: AxiosResponse<Http.ErrorResponse>;
  public errors: Http.Error[];

  constructor(response: AxiosResponse<Http.ErrorResponse>, errors: Http.Error[], status: number, url: string) {
    super();
    this.url = url;
    this.response = response;
    this.status = status;
    this.errors = errors;
  }

  get message() {
    // To get the specific error messages related to the details, the details must
    // be retrieved and parsed.
    return `
    There was a ${this.status} Client Error making a request to ${this.url}.
    ${JSON.stringify(this.errors)}
    `;
  }
}

export class AuthenticationError extends ClientError implements IHttpAuthenticationError {
  constructor(response: AxiosResponse<any>, errors: Http.Error[], url: string) {
    super(response, errors, 403, url);
  }
}

/**
 * A Server refers to a HTTP request error where there is a response
 * but the response status code is >= 500.  This can occur due to Internal
 * Server Errors.
 */
export class ServerError extends HttpError implements IHttpServerError {
  public static type = HttpErrorTypes.SERVER;
  public url?: string;
  public status: number;

  constructor(status: number, url?: string) {
    super();
    this.url = url;
    this.status = status;
  }

  get message(): string {
    if (!isNil(this.url)) {
      return `There was a ${this.status} Server Error making a request to ${this.url}.`;
    }
    return `There was a ${this.status} Server Error making a request.`;
  }
}

/**
 * A NetworkError refers to a HTTP request error where there is no response.
 * This can occur when the server is down or there are connectivity issues.
 */
export class NetworkError extends HttpError implements IHttpNetworkError {
  public static type = HttpErrorTypes.NETWORK;
  public url?: string | undefined;

  constructor(url?: string) {
    super();
    this.url = url;
  }

  get message(): string {
    if (!isNil(this.url)) {
      return `There was a Network Error making a request to ${this.url}.`;
    }
    return "There was a Network Error.";
  }
}
