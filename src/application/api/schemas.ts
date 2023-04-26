import { z } from "zod";

import * as formatters from "lib/util/formatters";

import * as errors from "../errors";

import * as types from "./types";

/* Used for the sole purpose of inferring whether or not the structure is close enough to the
   expected form that the errors produced from "zod" during schema parsing are applicable. */
const _TestApiFieldDetailSchema = z.object({
  field: z.string(),
  message: z.string().optional(),
  userMessage: z.string().optional(),
  code: z.string().optional(),
});

/* Used for the sole purpose of inferring whether or not the structure is close enough to the
   expected form that the errors produced from "zod" during schema parsing are applicable. */
const _TestApiFieldErrorResponseSchema = z.object({
  errors: z.array(_TestApiFieldDetailSchema),
});

const ApiGlobalDetailSchema = z
  .object({
    code: z.enum(errors.ApiGlobalErrorCodes.__ALL__, {
      /* It would be nice to eventually get the error message to reference the actual invalid code
       for purposes of logging. */
      invalid_type_error: "The provided code is not a recognized code for a global level error.",
    }),
    message: z.string({ invalid_type_error: "The internal message must be a string." }).optional(),
    userMessage: z
      .string({ invalid_type_error: "The user facing message must be a string." })
      .optional(),
  })
  .strict();

const ApiFieldDetailSchema = z
  .object({
    code: z.enum(errors.ApiFieldErrorCodes.__ALL__, {
      /* It would be nice to eventually get the error message to reference the actual invalid code
       for purposes of logging. */
      invalid_type_error: "The provided code is not a recognized code for a field level error.",
    }),
    message: z.string({ invalid_type_error: "The internal message must be a string." }).optional(),
    userMessage: z
      .string({ invalid_type_error: "The user facing message must be a string." })
      .optional(),
    field: z.string({
      required_error: "The field must be specified for a field level error.",
      invalid_type_error: "The field must be a string for a field level error.",
    }),
  })
  .strict();

export const ApiGlobalErrorResponseSchema = z.object({
  errors: z
    .array(ApiGlobalDetailSchema)
    .length(1, "Unexpectedly received multiple global level errors."),
});

export const ApiFieldErrorResponseSchema = z.object({
  errors: z.array(ApiFieldDetailSchema).nonempty("Expected at least 1 field level error."),
});

/**
 * A functional typeguard that takes an unknown value, {@link unknown}, and returns the proper
 * error response, {@link types.ApiFieldErrorResponse | types.ApiGlobalErrorResponse} if the
 * provided value conforms to the expected structure.
 *
 * Due to complications related to the deployment nature of this application, there are a lot of
 * unknowns and we cannot safely assume that any response the client receives is coming directly
 * from the application server.  This means we have to account for cases where the response is of
 * an unstructured or unknown form.
 *
 * The intention of this method is to determine whether or not the response is of the expected form,
 * and if so, indicate what specific form that is.  If the provided value does not conform to an
 * expected form, it will either return a string error message - if the form is close enough to
 * what we expect - or return null, if the form is entirely inconsistent with expectations.
 */
export const getApiErrorResponse = (
  d: unknown,
):
  | [errors.API_FIELD, types.ApiFieldErrorResponse]
  | [errors.API_GLOBAL, types.ApiGlobalErrorResponse]
  | string
  | null => {
  const parsedGlobal = ApiGlobalErrorResponseSchema.safeParse(d);
  if (parsedGlobal.success) {
    return [errors.ApiErrorTypes.GLOBAL, d as types.ApiGlobalErrorResponse];
  }
  const parsedField = ApiFieldErrorResponseSchema.safeParse(d);
  if (parsedField.success) {
    return [errors.ApiErrorTypes.FIELD, d as types.ApiFieldErrorResponse];
  }
  /* Here, all we know is that the structure is invalid.  We cannot necessarily determine whether
     or not the structure is an invalid form that the application server incidentally returned, or
     if the structure is an invalid form that was received from any number of other places in the
     deployment ecosystem.

     However, we can make an inference as to whether or not it is close enough to the expected form
     that logging an error message specific to how that form is invalid makes sense. */
  if (
    z
      .object({
        errors: z.array(z.any()),
      })
      .safeParse(d).success
  ) {
    /* If the form is close enough to the form of an ApiFieldErrorResponse, return the errors that
       that schema had returned. */
    if (_TestApiFieldErrorResponseSchema.safeParse(d).success) {
      return `The structure of the response for an HTTP Error is invalid.  There were (${
        parsedField.error.issues.length
      }) error(s): ${formatters.stringifyZodIssues(parsedField.error.issues)}`;
    }
    /* If the form is close enough to the form of an ApiGlobalErrorResponse, return the errors that
       that schema had returned. */
    return `The structure of the response for an HTTP Error is invalid.  There were (${
      parsedField.error.issues.length
    }) error(s): ${formatters.stringifyZodIssues(parsedGlobal.error.issues)}`;
  }
  return null;
};
