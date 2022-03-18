import { isNil } from "lodash";

export const isHttpError = (error: Http.Error | string | Error | Record<string, unknown>): error is Http.Error => {
  return (
    !isNil(error) &&
    typeof error === "object" &&
    (error as Http.Error).message !== undefined &&
    (error as Http.Error).code !== undefined &&
    (error as Http.Error).error_type !== undefined
  );
};

export const isFieldError = (e: Http.Error): e is Http.FieldError => (e as Http.FieldError).error_type === "field";

export const isBillingError = (e: Http.Error): e is Http.BillingError =>
  (e as Http.BillingError).error_type === "billing";

export const isAuthError = (e: Http.Error): e is Http.AuthError => (e as Http.AuthError).error_type === "auth";

export const isPermissionError = (e: Http.Error): e is Http.PermissionError =>
  (e as Http.PermissionError).error_type === "permission";
