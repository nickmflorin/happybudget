import { Optional } from "utility-types";
import { z } from "zod";

import { stringifyZodIssues } from "lib/util/formatters/attributes";
import { manageSuffixPunctuation } from "lib/util/formatters/formal";

import * as errorTypes from "../errorTypes";

type CustomLogContext = Record<string, Exclude<import("lib/schemas").JsonLiteral, ArrayBuffer>>;

export type ApplicationErrorLogContext<T extends CustomLogContext = CustomLogContext> = T & {
  message: string;
};

export type ApplicationErrorConfig<
  E extends errorTypes.ErrorType,
  C extends import("lib/schemas").JsonObject = import("lib/schemas").JsonObject,
> = Readonly<{
  readonly errorType: E;
  readonly message?: string;
  readonly logContext?: C;
  readonly prefix?: string;
  readonly detail?: string;
}>;

export interface IApplicationError<C extends CustomLogContext = CustomLogContext> {
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
    C extends CustomLogContext = CustomLogContext,
  >
  extends Error
  implements IApplicationError<C>
{
  protected readonly defaultPrefix: string | undefined = undefined;
  protected readonly defaultMessage: string = "There was an error.";
  private readonly _messageContent: string | undefined;
  private readonly _logContext: C | undefined;
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
      ? manageSuffixPunctuation(this._prefix, { add: ":", remove: true })
      : this.defaultPrefix !== undefined
      ? manageSuffixPunctuation(this.defaultPrefix, { add: ":", remove: true })
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
    return { ...this._logContext, message: this.message } as ApplicationErrorLogContext<C>;
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
  C extends CustomLogContext = CustomLogContext,
> = Optional<ApplicationErrorConfig<E, C>, "message"> &
  Readonly<{
    readonly userMessage?: string;
  }>;

export interface IApplicationUserError<C extends CustomLogContext = CustomLogContext>
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
    E extends errorTypes.ErrorType = errorTypes.ErrorType,
    C extends CustomLogContext = CustomLogContext,
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
  "errorType" | "detail"
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
      logContext: { ...config.logContext, value: JSON.stringify(config.value) },
      errorType: errorTypes.ErrorTypes.MALFORMED_DATA,
      detail: `Value: ${JSON.stringify(config.value)}`,
    });
  }
}

export class MalformedDataSchemaError extends MalformedDataError {
  public readonly error: z.ZodError<unknown>;
  defaultPrefix = "The object does not conform to the expected schema";

  constructor(
    config: Omit<MalformedDataErrorConfig, "message"> & { readonly error: z.ZodError<unknown> },
  ) {
    let additionalContext = {};
    if (config.error.issues.length === 1) {
      additionalContext = {
        code: config.error.issues[0].code,
        path: config.error.issues[0].path,
      };
    }
    super({ ...config, logContext: { ...config.logContext, ...additionalContext } });
    this.error = config.error;
  }

  protected get messageContent(): string {
    if (this.error.issues.length === 1) {
      return this.error.issues[0].message;
    }
    return stringifyZodIssues(this.error.issues);
  }
}
