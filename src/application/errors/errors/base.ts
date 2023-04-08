import { Optional } from "utility-types";
import { z } from "zod";

import { schemas, formatters } from "lib";

import * as errorTypes from "../errorTypes";

export type ApplicationErrorLogContext<T extends schemas.JsonObject = schemas.JsonObject> = T & {
  message: string;
};

export type ApplicationErrorConfig<
  E extends errorTypes.ErrorType,
  C extends schemas.JsonObject = schemas.JsonObject,
> = Readonly<{
  readonly errorType: E;
  readonly message?: string;
  readonly logContext: C;
  readonly prefix?: string;
  readonly detail?: string;
}>;

export interface IApplicationError<C extends schemas.JsonObject = schemas.JsonObject> {
  readonly message: string;
  readonly logContext: ApplicationErrorLogContext<C>;
}

/**
 * Base class for all manually thrown errors that occur in the application.
 *
 * @param {errorTypes.ErrorType} errorType
 *   The error type classification of the error.
 *
 * @param {string} message
 *   The string representation of the {@link BaseError} that *should only be referenced in logs*.
 *   This is not a message that should ever be provided outwardly to a user.
 */
export class ApplicationError<
    E extends errorTypes.ErrorType = errorTypes.ErrorType,
    C extends schemas.JsonObject = schemas.JsonObject,
  >
  extends Error
  implements IApplicationError<C>
{
  protected readonly defaultPrefix: string | undefined = undefined;
  protected readonly defaultMessage: string = "There was an error.";
  private readonly _messageContent: string | undefined;
  private readonly _logContext: C;
  private _prefix: string | undefined;
  private readonly _messageDetail: string | undefined = undefined;

  protected constructor(config: ApplicationErrorConfig<E, C>) {
    super(config.message);
    this._messageContent = config.message;
    this._logContext = config.logContext;
    this._messageDetail = config.detail;
  }

  public get prefix(): string | undefined {
    return this._prefix !== undefined
      ? formatters.manageSuffixPunctuation(this._prefix, { add: ":", remove: true })
      : this.defaultPrefix !== undefined
      ? formatters.manageSuffixPunctuation(this.defaultPrefix, { add: ":", remove: true })
      : undefined;
  }

  public set prefix(value: string | undefined) {
    this._prefix = value;
  }

  protected get messageContent(): string {
    return this._messageContent || this.defaultMessage;
  }

  protected get messageDetail(): string | undefined {
    return this._messageDetail;
  }

  public get logContext(): ApplicationErrorLogContext<C> {
    return { ...this._logContext, message: this.message };
  }

  public get message(): string {
    let base: string = this.messageContent;
    if (this.prefix !== undefined) {
      base = `${this.prefix} \n ${this.messageContent}`;
    }
    if (this.messageDetail !== undefined) {
      return `${base} \n ${this.messageDetail}`;
    }
    return base;
  }
}

export type ApplicationUserErrorConfig<
  E extends errorTypes.ErrorType,
  C extends schemas.JsonObject = schemas.JsonObject,
> = Optional<ApplicationErrorConfig<E, C>, "message"> &
  Readonly<{
    readonly userMessage?: string;
  }>;

export interface IApplicationUserError<C extends schemas.JsonObject = schemas.JsonObject>
  extends IApplicationError<C> {
  readonly userMessage: string;
}

/**
 * Base class for all manually thrown errors that occur in the application that have information
 * that may be outwardly communicated to a user.
 *
 * @param {errorTypes.ErrorType} errorType
 *   The error type classification of the error.
 *
 * @param {string} message
 *   The string representation of the {@link BaseUserError} that *should only be referenced in
 *   logs*.  This is not a message that should ever be provided outwardly to a user.
 *
 * @param {string} userMessage
 *   The string representation of the {@link BaseUserError} that should be used when, if
 *   contextually applicable, communicating the error to a user.
 */
export class ApplicationUserError<
    E extends errorTypes.ErrorType,
    C extends schemas.JsonObject = schemas.JsonObject,
  >
  extends ApplicationError<E, C>
  implements IApplicationUserError<C>
{
  public readonly _userMessage: string | undefined;

  protected constructor(config: ApplicationUserErrorConfig<E, C>) {
    super({ ...config, message: config.message || config.userMessage });
    this._userMessage = config.userMessage;
  }

  protected get defaultUserMessage(): string {
    return "There was an error.";
  }

  public get userMessage(): string {
    return this._userMessage || this.defaultUserMessage;
  }
}

type MalformedDataLogContext = {
  readonly value: string;
};

type MalformedDataErrorConfig = Omit<
  ApplicationErrorConfig<typeof errorTypes.ErrorTypes.MALFORMED_DATA>,
  "errorType" | "logContext" | "detail"
> & {
  readonly value: unknown;
};

export class MalformedDataError extends ApplicationError<
  typeof errorTypes.ErrorTypes.MALFORMED_DATA,
  MalformedDataLogContext
> {
  defaultMessage = "The data is malformed.";

  constructor(config: MalformedDataErrorConfig) {
    super({
      ...config,
      logContext: { value: JSON.stringify(config.value) },
      errorType: errorTypes.ErrorTypes.MALFORMED_DATA,
      detail: `Value: ${JSON.stringify(config.value)}`,
    });
  }
}

export class MalformedDataSchemaError<P> extends MalformedDataError {
  public readonly error: z.ZodError<P>;
  defaultPrefix = "The object does not conform to the expected schema";

  constructor(
    config: Omit<MalformedDataErrorConfig, "message"> & { readonly error: z.ZodError<P> },
  ) {
    super(config);
    this.error = config.error;
  }

  protected get messageContent(): string {
    return formatters.stringifyZodIssues(this.error.issues);
  }
}
