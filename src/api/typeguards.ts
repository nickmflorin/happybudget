import { isNil } from "lodash";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const isHttpError = (error: Http.Error | any): error is Http.Error => {
  return (
    !isNil(error) &&
    typeof error === "object" &&
    (error as Http.Error).message !== undefined &&
    (error as Http.Error).code !== undefined &&
    (error as Http.Error).error_type !== undefined
  );
};
