export type MessageFormatters<P extends Record<string, unknown>> = Partial<{
  [key in keyof P]: (v: Exclude<P[key], undefined>) => string;
}>;

export type InjectMessageOptions<
  P extends Record<string, unknown>,
  F extends MessageFormatters<P> = MessageFormatters<P>,
> = Readonly<{
  /**
   * Designates whether or not string formattable parameters in the string that are not provided as
   * parameters should be removed from the string.  If provided as `true`, all unformatted
   * parameters will be removed.  If provided as an array, {@link (keyof P)[]}, only unformatted
   * parameters that are in the array will be removed.
   */
  readonly removeUnformatted?: true | (keyof P)[];
  /**
   * A mapping of formatting functions that should be used to optionally format each string
   * formattable parameter in the data.  Formatting functions will only be applied to the parameter
   * if it is present in the string.
   */
  readonly formatters?: F;
  /**
   * Designates whether or not an error should be thrown if formattable parameters that are
   * present in the string are not present in the provided parameters.
   *
   * Default: false
   */
  readonly strict?: true;
  /**
   * Values that should be treated as missing and not injected into the resulting string.
   *
   * For instance, if the parameters are provided as { foo: undefined }, 'undefined' will be
   * injected into the string unless this parameter includes undefined - i.e.
   * { doNotInject: [ undefined ]}.
   */
  readonly doNotInject?: P[keyof P][];
  /**
   * Designates whether or not a warning should be logged if formattable parameters that are
   * present in the string are not present in the provided parameters.  Not applicable if 'strict'
   * is true.
   *
   * This should only be turned off if usage is expecting that there will be cases where a
   * parameter may not be provided and it should not be treated as a potential error.
   *
   * Default: true
   */
  readonly logMissing?: false;
  /**
   * Designates whether or not a warning should be logged if formattable parameters are provided
   * but not present in any message string.
   *
   * If provided as a false, unused context parameters will not be logged.  If provided as an array,
   * only unused parameters in that array will not be logged.
   *
   * Default: true
   */
  readonly ignoreUnused?: true | (keyof P)[];
  readonly defaults?: Partial<P>;
}>;

export type MessageData = string | string[];

export type MessageOptions<
  P extends Record<string, unknown>,
  F extends MessageFormatters<P> = MessageFormatters<P>,
> = Omit<InjectMessageOptions<P, F>, "strict" | "logMissing">;
