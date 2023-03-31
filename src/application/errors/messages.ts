import { logger } from "internal";
import { EnumeratedLiteralType, formatters, enumeratedLiterals, messages } from "lib";

import { ApiFieldDetailContext, ApiFieldDetail, HttpMethod } from "../api";

import * as codes from "./codes";
import * as errorTypes from "./errorTypes";

/**
 * Defines the scope that an error message pertains to, whether it be an error message that should
 * be outwardly communicated to a user or an error message that should be used for internal
 * purposes.
 *
 * Error messages that are scoped internally *will never* be shown to a user, whereas error messages
 * that are scoped for a user may be used for internal messages and logs if the internal message is
 * not defined.
 */
export const ErrorMessageScopes = enumeratedLiterals(["user", "internal"] as const);
export type ErrorMessageScope = EnumeratedLiteralType<typeof ErrorMessageScopes>;

export type ErrorMessageContext = ApiFieldDetailContext & {
  readonly code: codes.ErrorCode;
  readonly url: string;
  readonly status: number | string | codes.UNKNOWN;
  readonly method: HttpMethod | codes.UNKNOWN;
  readonly reason: string;
  readonly details: ApiFieldDetail[];
  readonly field: string;
};

type ErrorMessageDefaults = {
  readonly userMessage: messages.IMessage<ErrorMessageContext>;
  readonly message?: messages.IMessage<ErrorMessageContext>;
};

export const HTTP_USER_MESSAGE = messages.Message<ErrorMessageContext>([
  "There was an error with the request.",
]);

export const HTTP_MESSAGE = messages.Message<ErrorMessageContext>(
  [
    ":status :method | :code There was an error making a request to :url.",
    ":status :method | :code There was an error making a request to :url: :reason",
    ":status :method | :code There was an error making a request to :url: :details",
    ":status :method | :code There was an error making a request to :url: :reason :details",
  ],
  {
    doNotInject: [undefined],
    // The status or code will not be applicable if the error is a NetworkError.
    removeUnformatted: ["status", "code"],
    formatters: {
      status: (v: number | string | codes.UNKNOWN) => `[${v}]`,
      code: (v: string) => `(code = ${v})`,
      method: (v: string) => v.toUpperCase(),
      reason: (v: string) => formatters.capitalizeFirstAlphaChar(v),
      details: (v: ApiFieldDetail[]) =>
        `${v.length} Details(s): ` +
        formatters.stringifyAttributes(v, {
          messageKey: "message",
          ignore: ["userMessage"],
        }),
    },
  },
);

export const HTTP_MESSAGES: ErrorMessageDefaults = {
  userMessage: HTTP_USER_MESSAGE,
  message: HTTP_MESSAGE,
};

const ErrorTypeMessages: { [key in errorTypes.ErrorType]: ErrorMessageDefaults } = {
  [errorTypes.ErrorTypes.NETWORK]: {
    userMessage: messages.Message("There was an error with the request."),
    message: messages.Message("There was a network error."),
  },
  [errorTypes.ErrorTypes.FIELD]: {
    userMessage: messages.Message("There was an error with the request."),
    message: messages.Message("There was an unknown error."),
  },
  [errorTypes.ErrorTypes.GLOBAL]: {
    userMessage: messages.Message("There was an error with the request."),
    message: messages.Message("There was an unknown error."),
  },
  [errorTypes.ErrorTypes.CLIENT_VALIDATION]: {
    userMessage: messages.Message("There was an error."),
  },
};

type ErrorMessages = Partial<{ [key in codes.ErrorCode]: ErrorMessageDefaults }>;

const DefaultMessages: ErrorMessages = {
  [codes.ErrorCodes.UNKNOWN]: {
    userMessage: messages.Message("There was an error with the request."),
    message: messages.Message("There was an unknown error."),
  },
  [codes.ErrorCodes.METHOD_NOT_ALLOWED]: {
    userMessage: messages.Message("There was an error with the request."),
    message: messages.Message("The method is not allowed."),
  },
  [codes.ErrorCodes.INTERNAL_SERVER_ERROR]: {
    userMessage: messages.Message("There was an error with the request."),
    message: messages.Message("There was an internal server error."),
  },
  [codes.ErrorCodes.SERVICE_UNAVAILABLE]: {
    userMessage: messages.Message("There was an error with the request."),
    message: messages.Message("The service is unavailable."),
  },
  [codes.ErrorCodes.BODY_NOT_SERIALIZABLE]: {
    userMessage: messages.Message("There was an error with the request."),
    message: messages.Message("The response body was not serializable."),
  },
  [codes.ErrorCodes.BODY_NOT_PRESENT]: {
    userMessage: messages.Message("There was an error with the request."),
    message: messages.Message("The response body was not present."),
  },
  [codes.ErrorCodes.NOT_FOUND]: {
    userMessage: messages.Message("There was an error with the request."),
    message: messages.Message("The requested resource could not be found."),
  },
  [codes.ErrorCodes.REQUIRED]: {
    userMessage: messages.Message("The value is required."),
    message: messages.Message(["The field is required.", "The field :field is required."], {
      doNotInject: [undefined],
    }),
  },
  [codes.ErrorCodes.VALUE]: {
    userMessage: messages.Message(
      [
        "The provided value is invalid.",
        "The provided value :value is invalid.",
        "The provided value :value is invalid: :reason.",
      ],
      { formatters: { reason: (v: string) => formatters.toSentence(v) } },
    ),
    message: messages.Message(
      [
        "The value is invalid.",
        "The value :value is invalid.",
        "The field :field is invalid.",
        "The value :value for field :field is required.",
      ],
      { doNotInject: [undefined] },
    ),
  },
  [codes.ErrorCodes.UNIQUE]: {
    message: messages.Message([
      "The field must be unique.",
      "The field :field must be unique.",
      "The provided value for field :field must be unique",
      "The provided value :value is not unique.",
      "The provided value :value for the field :field is not unique.",
    ]),
    userMessage: messages.Message([
      "The provided value must be unique",
      "The provided value :value is not unique.",
    ]),
  },
  [codes.ErrorCodes.INVALID]: {
    userMessage: messages.Message("The value is invalid."),
    message: messages.Message(
      [
        "The value is invalid.",
        "The value :value is invalid.",
        "The field :field is invalid.",
        "The value :value for field :field is invalid.",
      ],
      { doNotInject: [undefined] },
    ),
  },
  [codes.ErrorCodes.MINLENGTH]: {
    userMessage: messages.Message([
      "The value does not meet the minimum length.",
      "The value does not meet the minimum length :minimum.",
    ]),
    message: messages.Message(
      [
        "The value does not meet the minimum length.",
        "The value :value does not meet the minimum length.",
        "The value :value for field :field does not meet the minimum length.",
      ],
      { doNotInject: [undefined] },
    ),
  },
  [codes.ErrorCodes.MAXLENGTH]: {
    userMessage: messages.Message(
      ["The value exceeds the maximum length.", "The value exceeds the maximum length :maximum."],
      { doNotInject: [undefined] },
    ),
    message: messages.Message(
      [
        "The value exceeds the maximum length.",
        "The value :value exceeds the maximum length.",
        "The value :value for field :field exceeds the maximum length.",
      ],
      { doNotInject: [undefined] },
    ),
  },
};

const _getMessageForScope = (
  defaults: ErrorMessageDefaults,
  scope: ErrorMessageScope = ErrorMessageScopes.USER,
): messages.IMessage<ErrorMessageContext> => {
  if (scope === ErrorMessageScopes.USER) {
    return defaults.userMessage;
  }
  return defaults.message === undefined ? defaults.userMessage : defaults.message;
};

/**
 * Returns the default message for the provided code, either as the message that is intended for the
 * user or as the message that is intended for internal purposes - the determination of which is
 * based on the provided scope, {@link ErrorMessageScope}.
 *
 * @param {codes.ErrorCode} code The error code for which the message should be returned.
 * @param {Partial<ErrorMessageContext> & { readonly scope: ErrorMessageScope }} params
 *   Contextual parameters that should be injected into the error message string associated with the
 *   code, along with the scope, {@link ErrorMessageScope}, that determines which message (the
 *   'userMessage' or the 'message') should be returned.
 *
 * @returns {string}
 *
 * Usage
 * -----
 * getErrorMessage(codes.ApiGlobalErrorCodes.NOT_FOUND, {
 *   url: "https://api.happybudget.io/api",
 *   method: "GET",
 *   status: 404,
 *   reason: "The page could not be found."
 * })
 * >>> "GET [404] (code = "not_found") There was an error making a request to "
 *     "https://api.happybudget.io/api: The page could not be found."
 */
export const getErrorMessage = <C extends codes.ErrorCode>(
  code: C,
  params?: Partial<ErrorMessageContext> & { readonly scope: ErrorMessageScope },
): string => {
  const { scope = ErrorMessageScopes.USER, ...context } = params || {};

  let defaultMessages = DefaultMessages[code];
  /* If the code is not explicitly associated with an error message, use the error type to return a
     more general message as a fallback. */
  if (defaultMessages === undefined) {
    const errorTypes = codes.getErrorTypes(code);
    if (errorTypes.length === 0) {
      throw new Error(`Invalid code '${code}', the code is not associated with an error type.`);
    } else if (errorTypes.length !== 1) {
      /* This will only happen if a code is listed under multiple error types.  For example, the
         UNKNOWN error code.  If this is the case - the code should always be in the
         `DefaultMessages` map such that the code type does not need to be used as a fallback.  If
         it is not, we have to make an assumption about which error code type it is.
         Unfortunately, this is not a situation that we can easily type for. */
      logger.warn(
        `The code '${code}' is associated with multiple error code types, ${errorTypes.join(
          ", ",
        )}, choosing the first by default.`,
      );
    }
    defaultMessages = ErrorTypeMessages[errorTypes[0]];
  }
  const msg = _getMessageForScope(defaultMessages, scope);
  // Do not include the error code in the context of a message rendered to the user.
  if (scope === ErrorMessageScopes.USER) {
    return msg.format(context);
  }
  return msg.format({ ...context, code } as ErrorMessageContext, { ignoreUnused: ["code"] });
};
