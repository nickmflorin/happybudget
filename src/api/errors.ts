import { isEqual, map, reduce, find, isNil } from "lodash";

import * as codes from "./codes";
import * as typeguards from "./typeguards";

type ErrorStandard<T extends Http.ResponseError> = {
  readonly typeguard: (e: Http.ResponseError | Http.UnknownResponseError) => e is T;
  readonly filter?: (e: T) => boolean;
  readonly func: (e: T) => T;
  readonly code?: T["code"];
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const ErrorStandards: ErrorStandard<any>[] = [
  {
    typeguard: typeguards.isResponseFieldError,
    filter: (e: Http.ResponseFieldError) => e.code === codes.FieldErrorCodes.UNIQUE && e.field === "email",
    func: (e: Http.ResponseFieldError) => ({ ...e, message: "A user already exists with the provided email." })
  },
  {
    typeguard: typeguards.isResponseFieldError,
    code: codes.FieldErrorCodes.UNIQUE,
    func: (e: Http.ResponseFieldError) => ({ ...e, message: `The field ${e.field} must be unique.` })
  },
  {
    typeguard: typeguards.isResponseFieldError,
    code: codes.FieldErrorCodes.REQUIRED,
    func: (e: Http.ResponseFieldError) => ({ ...e, message: `The field ${e.field} is required.` })
  }
];

const standardizeResponseError = <T extends Http.ResponseError | Http.UnknownResponseError>(e: T): T =>
  reduce(
    ErrorStandards,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (curr: T, s: ErrorStandard<any>): T => {
      if (s.typeguard(e)) {
        if (s.code !== undefined && curr.code !== s.code) {
          return curr;
        } else if (s.filter !== undefined && s.filter(e) !== true) {
          return curr;
        }
        return s.func(e) as T;
      }
      return curr;
    },
    e
  );

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

type RequestErrorConfig = {
  readonly name?: string | undefined;
  readonly message: string;
  readonly url: string | undefined;
};

/**
 * Base class for all request errors that occur when an API request is made to
 * the internal API supporting the FE.  Should not be used directly, but rather
 * used indirectly via ClientError, NetworkError or ServerError.
 */
export abstract class RequestError extends Error implements Http.IRequestError {
  public url: string;

  constructor(config: RequestErrorConfig) {
    super("");
    this.message = config.message;
    this.name = config.name || "HttpError";
    this.url = config.url || "";
  }

  abstract equals(other: Http.ApiError): boolean;
}

const stringifyErrors = <E extends Http.ResponseError | Http.UnknownResponseError>(
  errors: Omit<E, "error_type">[]
): string => {
  if (errors.length === 0) {
    return "";
  } else if (errors.length === 1) {
    return errors[0].message;
  } else {
    const errorStrings: string[] = map(
      errors,
      (e: Omit<E, "error_type">, index: number) => `${index + 1}. ${e.message}`
    );
    return "\n" + errorStrings.join("\n");
  }
};

export const stringifyResponseFieldError = (
  e: Omit<Http.ResponseFieldError, "error_type"> | UIFieldNotification,
  index?: number
): string => {
  const errIsResponseError = (
    er: Omit<Http.ResponseFieldError, "error_type"> | UIFieldNotification
  ): er is Omit<Http.ResponseFieldError, "error_type"> =>
    (er as Omit<Http.ResponseFieldError, "error_type">).code !== undefined;

  const message = errIsResponseError(e)
    ? standardizeResponseError<Http.ResponseFieldError>({ ...e, error_type: "field" }).message
    : e.message;
  return index === undefined ? `<b>${e.field}</b>: ${message}` : `${index}. <b>${e.field}</b>: ${message}`;
};

export const stringifyResponseFieldErrors = (
  errors: (Omit<Http.ResponseFieldError, "error_type"> | UIFieldNotification)[],
  includeIndices = true
): string[] =>
  map(errors, (e: Omit<Http.ResponseFieldError, "error_type"> | UIFieldNotification, index: number): string =>
    stringifyResponseFieldError(e, includeIndices === false ? undefined : index + 1)
  );

export const stringifyFieldErrorsToMessage = (
  errors: (Omit<Http.ResponseFieldError, "error_type"> | UIFieldNotification)[],
  includeIndices = true
): string =>
  "There were errors related to the following fields: \n" +
  stringifyResponseFieldErrors(errors, includeIndices).join("\n");

type ClientErrorConfig<E extends Http.ResponseError | Http.UnknownResponseError> = Omit<
  RequestErrorConfig,
  "message" | "name"
> & {
  readonly status: number;
  readonly errors: Omit<E, "error_type">[];
  readonly userFacingMessage: string;
  readonly errorType: E["error_type"];
};

/**
 * A ClientError refers to an HTTP request error where there is a response
 * and the response status code is between 400 and 499.  In this case, Django
 * REST Framework will include an error in the response body.
 */
export abstract class ClientError<
    E extends Http.ResponseError | Http.UnknownResponseError = Http.ResponseError | Http.UnknownResponseError
  >
  extends RequestError
  implements Http.IClientError<E>
{
  public status: number;
  public errorType: E["error_type"];
  /* We allow this to be a plural because in the case of field level errors,
     there may be multiple errors in the response body. */
  public errors: Omit<E, "error_type">[];
  public userFacingMessage: string;

  constructor(config: ClientErrorConfig<E>) {
    super({
      message:
        `[${config.status}] There was an error making a request to ` +
        `${config.url || "..."}: ` +
        `${stringifyErrors(config.errors)}`,
      name: "ClientError",
      ...config
    });
    this.errorType = config.errorType;
    this.status = config.status;

    this.errors = map(config.errors, (e: Omit<E, "error_type">) =>
      standardizeResponseError<E>({ ...e, error_type: this.errorType } as E)
    );
    this.userFacingMessage = config.userFacingMessage;
  }

  equals = (other: Http.ApiError): boolean =>
    other instanceof ClientError && other.errorType === this.errorType && isEqual(this.errors, other.errors);
}

export abstract class SingularError<E extends Http.ResponseError | Http.UnknownResponseError>
  extends ClientError<E>
  implements Http.ISingularClientError<E>
{
  public error: Omit<E, "error_type">;
  public code: E["code"];

  constructor(config: Omit<E, "error_type"> & Omit<ClientErrorConfig<E>, "errors" | "userFacingMessage">) {
    super({
      ...config,
      userFacingMessage: config.message,
      errors: [{ message: config.message, code: config.code } as E]
    });
    // Assign based on the standardized errors.
    this.error = this.errors[0];
    this.code = config.code;
  }
}

export class UnknownClientError extends SingularError<Http.UnknownResponseError> implements Http.IUnknownError {
  constructor(
    config: Omit<ClientErrorConfig<Http.UnknownResponseError>, "errors" | "userFacingMessage" | "errorType">
  ) {
    super({
      ...config,
      message: "Unknown client error.",
      code: codes.UnknownErrorCodes.UNKNOWN,
      errorType: "unknown"
    });
  }
}

export class AuthenticationError extends SingularError<Http.ResponseAuthError> implements Http.IAuthenticationError {
  public userId: number | undefined;

  constructor(
    config: Omit<Http.ResponseAuthError, "error_type"> &
      Omit<ClientErrorConfig<Http.ResponseAuthError>, "errors" | "userFacingMessage" | "errorType">
  ) {
    super({ ...config, errorType: "auth" });
    this.userId = config.user_id;
  }
}

export class PermissionError extends SingularError<Http.ResponsePermissionError> implements Http.IPermissionError {
  constructor(
    config: Omit<Http.ResponsePermissionError, "error_type"> &
      Omit<ClientErrorConfig<Http.ResponsePermissionError>, "errors" | "userFacingMessage" | "errorType">
  ) {
    super({ ...config, errorType: "permission" });
  }
}

export class HttpError extends SingularError<Http.ResponseHttpError> implements Http.IHttpError {
  constructor(
    config: Omit<Http.ResponseHttpError, "error_type"> &
      Omit<ClientErrorConfig<Http.ResponseHttpError>, "errors" | "userFacingMessage" | "errorType">
  ) {
    super({ ...config, errorType: "http" });
  }
}

export class BillingError extends SingularError<Http.ResponseBillingError> implements Http.IBillingError {
  constructor(
    config: Omit<Http.ResponseBillingError, "error_type"> &
      Omit<ClientErrorConfig<Http.ResponseBillingError>, "errors" | "userFacingMessage" | "errorType">
  ) {
    super({ ...config, errorType: "billing" });
  }
}

export class BadRequestError extends SingularError<Http.ResponseBadRequestError> implements Http.IBadRequestError {
  constructor(
    config: Omit<Http.ResponseBadRequestError, "error_type"> &
      Omit<ClientErrorConfig<Http.ResponseBadRequestError>, "errors" | "userFacingMessage" | "errorType">
  ) {
    super({ ...config, errorType: "bad_request" });
  }
}

export class FormError extends SingularError<Http.ResponseFormError> implements Http.IFormError {
  constructor(
    config: Omit<Http.ResponseFormError, "error_type"> &
      Omit<ClientErrorConfig<Http.ResponseFormError>, "errors" | "userFacingMessage" | "errorType">
  ) {
    super({ ...config, errorType: "form" });
  }
}

export class FieldsError extends ClientError<Http.ResponseFieldError> implements Http.IFieldsError {
  constructor(config: Omit<ClientErrorConfig<Http.ResponseFieldError>, "userFacingMessage" | "errorType">) {
    super({ ...config, userFacingMessage: stringifyFieldErrorsToMessage(config.errors), errorType: "field" });
  }

  getError = (field: string): Omit<Http.ResponseFieldError, "error_type"> | null => {
    const fld: Omit<Http.ResponseFieldError, "error_type"> | undefined = find(this.errors, { field });
    return fld === undefined ? null : fld;
  };
}

/**
 * A Server refers to a HTTP request error where there is a response
 * but the response status code is >= 500.  This can occur due to Internal
 * Server Errors.
 */
export class ServerError extends RequestError implements Http.IServerError {
  public status: number;

  constructor(config: Omit<RequestErrorConfig, "message" | "name"> & { readonly status: number }) {
    super({
      message: `There was a ${config.status} server error making a request to ${config.url || "..."}.`,
      name: "ServerError",
      ...config
    });
    this.status = config.status;
  }

  equals = (other: Http.ApiError): boolean => other instanceof ServerError;
}

/**
 * A NetworkError refers to a HTTP request error where there is no response.
 * This can occur when the server is down or there are connectivity issues.
 */
export class NetworkError extends RequestError implements Http.INetworkError {
  constructor(config: Omit<RequestErrorConfig, "message" | "name">) {
    super({
      message: !isNil(config.url)
        ? `There was a network error making a request to ${config.url}.`
        : "There was a network error.",
      name: "NetworkError",
      ...config
    });
  }

  equals = (other: Http.ApiError): boolean => other instanceof NetworkError;
}
