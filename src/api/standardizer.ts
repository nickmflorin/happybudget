import { isMatch, reduce } from "lodash";

export type ErrorFilter = ((error: Http.Error) => boolean) | { [key: string]: any };
export type ErrorStandardizer<T> = (error: T) => T;

const testError = (filt: ErrorFilter, error: Http.Error): boolean =>
  typeof filt === "function" ? filt(error) : isMatch(error, filt);

export const Standard = <T extends Http.Error = Http.Error>(
  filter: ErrorFilter,
  standardizer: ErrorStandardizer<T>
): ErrorStandardizer<T> => (error: T): T => {
  /* eslint-disable indent */
  if (testError(filter, error)) {
    return standardizer(error);
  }
  return error;
};

export const STANDARDS: ErrorStandardizer<any>[] = [
  Standard<Http.FieldError>(
    (error: Http.Error) => error.error_type === "field" && error.code === "unique",
    (error: Http.FieldError) => ({ ...error, message: `The field ${error.field} must be unique.` })
  )
];

export const standardizeError = <T extends Http.BaseError = Http.BaseError>(error: T) => {
  return reduce(STANDARDS, (e: T, standard) => standard(e), error);
};
