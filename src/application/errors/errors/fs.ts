import { ErrorTypes } from "../errorTypes";

import { ApplicationError, ApplicationErrorConfig } from "./base";

export class FileLoadError extends ApplicationError<
  typeof ErrorTypes.FILE_LOADING,
  { readonly statusCode: number }
> {
  readonly statusCode: number;

  constructor(
    config: Omit<ApplicationErrorConfig<typeof ErrorTypes.FILE_LOADING>, "errorType"> & {
      readonly statusCode: number;
    },
  ) {
    super({
      ...config,
      errorType: ErrorTypes.FILE_LOADING,
      logContext: { statusCode: config.statusCode },
    });
    this.statusCode = config.statusCode;
  }
}

export class InvalidFileExtensionError extends ApplicationError<
  typeof ErrorTypes.FILENAME,
  { extension: string }
> {
  public readonly extension: string;

  constructor(extension: string) {
    super({
      message: `The file extension ${extension} is invalid.`,
      logContext: { extension },
      errorType: ErrorTypes.FILENAME,
    });
    this.extension = extension;
  }
}

export class InvalidFileNameError extends ApplicationError<
  typeof ErrorTypes.FILENAME,
  { filename: string }
> {
  public readonly filename: string;

  constructor(filename: string) {
    super({
      message: `The file name ${filename} is invalid.`,
      logContext: { filename },
      errorType: ErrorTypes.FILENAME,
    });
    this.filename = filename;
  }
}
