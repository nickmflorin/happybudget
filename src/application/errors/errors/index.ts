export * from "./base";
export * from "./http";
export * from "./fs";

import * as base from "./base";
import * as fs from "./fs";
import * as http from "./http";

export type ApplicationErrorType =
  | base.ApplicationError
  | base.ApplicationUserError
  | base.MalformedDataError
  | base.MalformedDataSchemaError
  | http.HttpError
  | fs.FileErrorType;
