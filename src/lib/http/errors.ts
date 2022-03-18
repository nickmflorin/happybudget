import { reduce } from "lodash";

import * as api from "api";

import * as typeguards from "./typeguards";

type ErrorStandard<T extends Http.Error> = {
  readonly typeguard: (e: Http.Error) => e is T;
  readonly filter?: (e: T) => boolean;
  readonly func: (e: T) => T;
  readonly code?: T["code"];
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const ErrorStandards: ErrorStandard<any>[] = [
  {
    typeguard: typeguards.isFieldError,
    filter: (e: Http.FieldError) => e.code === api.FieldErrorCodes.UNIQUE && e.field === "email",
    func: (e: Http.FieldError) => ({ ...e, message: "A user already exists with the provided email." })
  },
  {
    typeguard: typeguards.isFieldError,
    code: api.FieldErrorCodes.UNIQUE,
    func: (e: Http.FieldError) => ({ ...e, message: `The field ${e.field} must be unique.` })
  },
  {
    typeguard: typeguards.isFieldError,
    code: api.FieldErrorCodes.REQUIRED,
    func: (e: Http.FieldError) => ({ ...e, message: `The field ${e.field} is required.` })
  }
];

export const standardizeError = <T extends Http.Error>(e: T) =>
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
        return s.func(e);
      }
      return curr;
    },
    e
  );

export const standardizedErrorMessage = <T extends Http.Error>(error: T) => standardizeError(error).message;
