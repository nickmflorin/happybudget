import { enumeratedLiterals } from "lib/util/literals";

import * as errors from "../../errors";

import { ApiSuccessResponse } from "./response";

export * from "./auth";
export * from "./client";
export * from "./payload";
export * from "./query";
export * from "./response";
export * from "./schemas";
export * from "./urls";

export const HttpMethods = enumeratedLiterals(["GET", "POST", "PATCH", "DELETE"] as const);
export type HttpMethod = import("lib/util/types").EnumeratedLiteralType<typeof HttpMethods>;

export const RequestCredentials = enumeratedLiterals(["same-origin", "include", "omit"] as const);
export type RequestCredential = import("lib/util/types").EnumeratedLiteralType<
  typeof RequestCredentials
>;

export enum STATUS_CODES {
  HTTP_200_OK = 200,
  HTTP_201_OK = 201,
  HTTP_204_OK = 204,
  HTTP_400_BAD_REQUEST = 400,
  HTTP_401_UNAUTHORIZED = 401,
  HTTP_403_FORBIDDEN = 403,
  HTTP_404_NOT_FOUND = 404,
  HTTP_405_METHOD_NOT_ALLOWED = 405,
  HTTP_500_INTERNAL_SERVER_ERROR = 500,
  HTTP_503_SERVICE_UNAVAILABLE = 503,
}

export type StatusCode = typeof STATUS_CODES[keyof typeof STATUS_CODES];

export type ApiFieldDetailContext = {
  readonly minimum: number;
  readonly maximum: number;
  readonly minimumLength: number;
  readonly maximumLength: number;
  readonly value: string | number | null | undefined;
};

type BaseApiDetail<
  T extends errors.ApiErrorType = errors.ApiErrorType,
  C extends errors.ErrorCode<T> = errors.ErrorCode<T>,
> = {
  code: C;
  message?: string;
  userMessage?: string;
};

export type ApiFieldDetail<
  C extends errors.ErrorCode<errors.API_FIELD> = errors.ErrorCode<errors.API_FIELD>,
> = BaseApiDetail<errors.API_FIELD, C> & {
  field: string;
} & Partial<ApiFieldDetailContext>;

export type ApiGlobalDetail<
  C extends errors.ErrorCode<errors.API_GLOBAL> = errors.ErrorCode<errors.API_GLOBAL>,
> = BaseApiDetail<errors.API_GLOBAL, C>;

export type ApiDetail<
  T extends errors.ApiErrorType = errors.ApiErrorType,
  C extends errors.ErrorCode<T> = errors.ErrorCode<T>,
> = T extends "global"
  ? C extends errors.ErrorCode<T>
    ? ApiGlobalDetail<C>
    : never
  : T extends "field"
  ? C extends errors.ErrorCode<T>
    ? ApiFieldDetail<C>
    : never
  : T extends errors.ApiErrorType
  ? ApiGlobalDetail<C & errors.ApiGlobalErrorCode> | ApiFieldDetail<C & errors.ApiFieldErrorCode>
  : never;

/**
 * Represents a form of the JSON body of a {@link Response} when an error occurs during a request
 * between the client and the server and the server embeds information about the error that occurred
 * in the JSON body of the response, {@link Response}.
 *
 * When a {@link Response} with this type of JSON body occurs, there will only ever be 1 error,
 * {@link ApiDetail<API_GLOBAL>}.
 */
export type ApiGlobalErrorResponse<
  C extends errors.ApiGlobalErrorCode = errors.ApiGlobalErrorCode,
> = Readonly<{
  errors: [ApiDetail<errors.API_GLOBAL, C>];
}>;

/**
 * Represents a form of the JSON body of a {@link Response} when an error occurs during a request
 * between the client and the server and the server embeds information about the error that occurred
 * in the JSON body of the response, {@link Response}.
 *
 * When a {@link Response} with this type of JSON body occurs, there may be 1 or multiple errors,
 * {@link ApiDetail<API_FIELD>[]}, each of which corresponds to a specific field of the submitted
 * data.
 *
 * Note:
 * ----
 * The type {@link ApiFieldErrorResponse} is generic because the 'userMessage' and/or 'message'
 * attributes may or may not be present on the detail, {@link ApiDetail<API_FIELD>}, at the time it
 * is received by the client.  But, those attributes will be set based on the code of the
 * {@link ApiDetail<API_FIELD>} if they are not present, before being attributed on the
 * {@link ApiFieldError} object.
 *
 * @example
 * const data: ApiFieldErrorResponse = {
 *   errors: [
 *     {
 *       field: "name",
 *       code: "invalid",
 *       userMessasge: "The name cannot be blank."
 *     },
 *     {
 *       field: "description",
 *       code: "required",
 *       userMessage: "The description is required."
 *     }
 *   ]
 * }
 */
export type ApiFieldErrorResponse<C extends errors.ApiFieldErrorCode = errors.ApiFieldErrorCode> =
  Readonly<{
    errors: ApiDetail<errors.API_FIELD, C>[];
  }>;

type ErrorIndicators =
  | [errors.API_GLOBAL, errors.ApiGlobalErrorCode]
  | [errors.API_FIELD, errors.ApiFieldErrorCode]
  | errors.ApiErrorType;

/**
 * The form of the JSON body for responses rendered on the server when an error occurs.
 */
export type ApiErrorResponse<T extends ErrorIndicators = errors.ApiErrorType> =
  T extends errors.ApiErrorType
    ? {
        global: ApiGlobalErrorResponse;
        field: ApiFieldErrorResponse;
      }[T]
    : T extends [errors.API_GLOBAL, infer C extends errors.ApiGlobalErrorCode]
    ? ApiGlobalErrorResponse<C>
    : T extends [errors.API_FIELD, infer C extends errors.ApiFieldErrorCode]
    ? ApiFieldErrorResponse<C>
    : never;

/**
 * Represents the JSON body of a response that is *intentionally* rendered by the internal server.
 *
 * All responses that are intentionally rendered by the server in API routes must conform to this
 * type.  The {@link ApiResponse} type consists of a union of the {@link ApiSuccessResponse} type
 * and the {@link ApiErrorResponse} type.  The generics type arguments that are provided to this
 * type, {@link B}, {@link S} and {@link E} control the specifics of both the error response form
 * and the successful response form that comprise the union:
 *
 * Patterns
 * ========
 * 1. ApiResponse
 * 2. ApiResponse<{ foo: string }>;
 * 3. ApiResponse<
 *      { foo: string },
 *      { data: { foo: string }, count: number }
 *    >
 * 4. ApiResponse<{ foo: string }, "field" | "global">
 * 5. ApiResponse<
 *      { foo: string },
 *      { data: { foo: string }, count: number },
 *      "field" | "global"
 *    >
 * 6. ApiResponse<
 *      { foo: string },
 *      ["field", errors.ApiFieldErrorCode]
 *    >
 * 7. ApiResponse<
 *      { foo: string },
 *      ["global", errors.ApiGlobalErrorCode]
 *    >
 * 8. ApiResponse<
 *      { foo: string },
 *      { data: { foo: string }, count: number },
 *      ["field", errors.ApiFieldErrorCode]
 *    >
 * 9. ApiResponse<
 *      { foo: string },
 *      { data: { foo: string }, count: number },
 *      ["global", errors.ApiGlobalErrorCode]
 *    >
 *
 * Usage
 * =====
 *
 * Usage w/o Generics
 * ------------------
 * When generic type arguments are not provided, the type represents all forms of a successful
 * response body or any expected form of an error response body:
 *
 * >>> ApiResponse
 *
 * Meaning: Either a successful response with a generic JSON body, { data: Json }, or any
 *          expected error response body.
 * Expanded:
 *   - ApiSuccessResponse | ApiErrorResponse
 *   - | { data: JsonBody }
 *     | { errors: [ApiDetail<errors.API_GLOBAL, C>] }
 *     | { errors: ApiDetail<errors.API_FIELD, C>[] }
 *
 * Usage w Response Body
 * ---------------------
 * In cases where the JSON body of the response for a successful request should be typed more
 * strictly, the first generic type argument can be provided to type that response data:
 *
 * >>> ApiResponse<{ foo: string }>
 *
 * Meaning: Either a successful response with response body { data: { foo: string }} or any expected
 *          error response body.
 * Expanded:
 *   - ApiSuccessResponse<{ foo: string }> | ApiErrorResponse
 *   - | { data: { foo: string } }
 *     | { errors: [ApiDetail<errors.API_GLOBAL, C>] }
 *     | { errors: ApiDetail<errors.API_FIELD, C>[] }
 *
 * Usage w Response Body & Meta Data
 * ---------------------------------
 * In cases where the JSON body of the response for a successful request consists of more than just
 * the "data" key (i.e. { data: ... }), such as a response body that contains additional meta data,
 * the JSON response body can be provided as the second generic type argument:
 *
 * >>> type Model = { foo: string };
 * >>> type ListResponseBody<T> = { data: T; count: number; page: number };
 * >>> ApiResponse<Model, ListResponseBody<Model>>
 *
 * Meaning: Either a successful response with response body that conforms to the second generic type
 *          argument (but extends { data: X } where X is the first generic type argument) or any
 *          expected error response body.
 * Expanded:
 *   - ApiSuccessResponse<{ foo: string }> & { count: number; page: number } | ApiErrorResponse
 *   - | { data: { foo: string; }; count: number; page: number  }
 *     | { errors: [ApiDetail<errors.API_GLOBAL, C>] }
 *     | { errors: ApiDetail<errors.API_FIELD, C>[] }
 *
 * Usage w Errors
 * -------------
 * If the last generic type argument (where last is either the second or the third argument,
 * depending on whether or not the response body with meta data is the second type argument) is
 * of the form {@link ErrorIndicators}, the forms of the error response body will be narrowed:
 *
 * // Represents (ApiSuccessResponse<M> & B) | { errors: ApiDetail<errors.API_FIELD>[] }
 * >>> ApiResponse<M, B, "field">
 *
 * // Represents ApiSuccessResponse<M> | { errors: ApiDetail<errors.API_FIELD>[] }
 * >>> ApiResponse<M, "field">
 *
 * // Represents (ApiSuccessResponse<M> & B) | { errors: [ApiDetail<errors.API_GLOBAL>] }
 * >>> ApiResponse<M, B, "global">
 *
 * // Represents ApiSuccessResponse<M> | { errors: [ApiDetail<errors.API_GLOBAL>] }
 * >>> ApiResponse<M, "global">
 *
 * This generic type argument can also be provided as both the error type ("field" or "global")
 * and the associated error code, {@link C}:
 *
 * // Represents
 * //   | ApiSuccessResponse<M>
 * //   | { errors: [ { code: "not_found"; message?: string; userMessage?: string }]}
 * >>> ApiResponse<M, ["global", "not_found"]>
 */
export type ApiResponse<
  S extends ApiSuccessResponse | ErrorIndicators,
  E extends ErrorIndicators = ErrorIndicators,
> = S extends ApiSuccessResponse
  ? S | ApiErrorResponse<E>
  : S extends ErrorIndicators
  ? ApiSuccessResponse | ApiErrorResponse<S>
  : never;
