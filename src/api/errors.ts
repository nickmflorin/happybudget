import { find, isNil, filter, map, forEach } from "lodash";
import { AxiosResponse } from "axios";

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

export interface IHttpErrorDetailLookup {
  readonly field?: string;
  readonly code?: string;
  readonly codes?: string[];
}

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
 *
 * TODO:
 * ----
 * Some of the logic here for obtaining the pertinent details/messages should
 * be re-thought to some degree.  There may be better ways of doing this,
 * better assumptions to make that makes the implementation easier or more
 * convenient ways of doing things.
 */
export class ClientError extends HttpError implements IHttpClientError {
  public static type = HttpErrorTypes.CLIENT;
  public status: number;
  public url: string;
  public response: AxiosResponse<any>;
  public errors: { [key: string]: Http.IErrorDetail[] };

  constructor(
    response: AxiosResponse<any>,
    errors: { [key: string]: Http.IErrorDetail[] },
    status: number,
    url: string
  ) {
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

  /**
   * Retrieves the detail or details ({ message: ..., code: ... }) for the
   * provided lookup.
   *
   * @param lookup: The field and/or code(s) to filter the details by.
   *                field:  The field to filter the details by.  If not provided,
   *                        the global __all__ field will be used.
   *                code:   The code to find a detail for.
   *                codes:  The codes to filter the details by.
   */
  getDetails = (lookup: IHttpErrorDetailLookup): Http.IErrorDetail[] | undefined => {
    const field = lookup.field || "__all__";
    const details = this.errors[field];
    if (!isNil(details)) {
      if (!isNil(lookup.code)) {
        // If the code is provided, return the detail that has the provided code,
        // if it exists.
        const detail: Http.IErrorDetail | undefined = find(details, { code: lookup.code });
        if (!isNil(detail)) {
          return [detail];
        }
        return undefined;
      } else if (!isNil(lookup.codes)) {
        // If a set of codes are provided, return the details for which the code
        // is in the set of provided codes.
        const codesToFilterBy: string[] = lookup.codes;
        const filtered = filter(details, (detail: Http.IErrorDetail) => codesToFilterBy.indexOf(detail.code) !== -1);
        if (filtered.length === 0) {
          return undefined;
        }
        return filtered;
      } else {
        // Return the details for all the codes.
        return details;
      }
    } else {
      return undefined;
    }
  };

  /**
   * Returns the details for the fields in the error, excluding the global
   * __all__ errors.
   */
  getFieldDetails = (): { [key: string]: Http.IErrorDetail[] } | undefined => {
    const fieldErrors: { [key: string]: Http.IErrorDetail[] } = {};
    Object.keys(this.errors).forEach((fld: string) => {
      if (fld !== "__all__") {
        fieldErrors[fld] = this.errors[fld];
      }
    });
    // Return undefined if there are no field level errors.
    if (Object.keys(fieldErrors)) {
      return fieldErrors;
    }
    return undefined;
  };

  /**
   * Returns the details for the global field, __all__, excluding the field
   * level errors.
   */
  getGlobalDetails = (): Http.IErrorDetail[] | undefined => {
    return this.errors.__all__;
  };

  /**
   * Returns the first global error included on the error.  The vast majority
   * of the time, when there are global errors in the response indicated with
   * the __all__ parameter, it will be an array of length-1, so this is usually
   * safe to assume that it will encapsulate the main error that the response
   * is communicating.
   */
  getFirstGlobalDetail = (): Http.IErrorDetail | undefined => {
    if (!isNil(this.errors.__all__) && this.errors.__all__.length !== 0) {
      return this.errors.__all__[0];
    }
    return undefined;
  };

  /**
   * Returns whether or not there is an error detail for the provided
   * lookup.
   * @param lookup  The field and/or code(s) to filter the details by.
   */
  hasError = (lookup: IHttpErrorDetailLookup): boolean => {
    const details: Http.IErrorDetail[] | undefined = this.getDetails(lookup);
    return details !== undefined;
  };
}

export class AuthenticationError extends ClientError implements IHttpAuthenticationError {
  constructor(response: AxiosResponse<any>, errors: { [key: string]: Http.IErrorDetail[] }, url: string) {
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

export const renderFieldErrorsInForm = (form: any, e: ClientError) => {
  const fieldsWithErrors: { name: string; errors: string[] }[] = [];
  forEach(e.errors, (errors: Http.IErrorDetail[], field: string) => {
    fieldsWithErrors.push({
      name: field,
      errors: map(errors, (error: Http.IErrorDetail) => error.message)
    });
  });
  form.setFields(fieldsWithErrors);
};
