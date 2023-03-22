import { intersection, uniq } from "lodash";

import { logger } from "internal";

import * as stringFormatters from "../formatters";
import * as validators from "../validators";
import * as types from "./types";

/**
 * Returns an array of string formattable parameters, {@link StringFormattableParam[]} that are in
 * a string.
 *
 * A string formattable parameter is defined as a parameter in a string that is a placeholder for
 * string formatting and is identified with the parameter name preceeded with a colon: ":paramName".
 *
 * A string formattable parameter is defined as a parameter in a string that is a placeholder for
 * string formatting and is identified with the parameter name preceeded with a colon: ":paramName".
 *
 * The following will be properly treated as a formattable string parameter:
 *   - :foo (param = "foo")
 *   - :foo9 (param = "foo9")
 *
 * The following will not be treated as a formattable string parameter:
 *   - :9foo
 *   - :_foo
 *   - :.foo
 *
 * @example
 * // Returns ["animal", "object"]
 * getStringFormatParams("The :animal jumped over the :object.")
 *
 * @param {string} value
 *   The string value that contains the string formattable parameters.
 *
 * @returns {string[]}
 */
export const getStringFormatParams = (value: string): string[] => {
  const REGEX = /:([a-zA-Z]+[a-zA-Z0-9]+)/g;
  return Array.from(value.matchAll(REGEX)).map((i: RegExpMatchArray) => i[1]);
};

type _MessageInfo = {
  message: string;
  inject: string[];
  missing: string[];
  unused: string[];
  remove: string[];
};

/**
 * Returns a string that is created from the injection of the provided parameters, {@link Params},
 * into the provided message, {@link types.Message<Params>}.
 *
 * If multiple string values are provided, the method will find the optimal string in the set,
 * inject the parameters and return the resulting string.  The determination of which value is
 * optional is made based first on finding the string with the minimum number of formattable
 * parameters that are not present in the provided set.  Then, if one or more strings has the same
 * number of minimum unformattable parameters, the determination is then made based on the string
 * that had the most formattable parameters injected.
 *
 * @example
 * const values = [
 *   "The :animal named :name jumped over the :item.",
 *   "The :animal named :name jumped over the log.",
 *   "The fox named :name jumped over the log."
 * ]
 * // Returns "The fox named Foxy jumped over the log."
 * formatMessage(values, { name: "Foxy"})
 *
 * // Returns "The rabbit named Hops jumped over the log."
 * formatMessage(values, { name: "Hops", animal: "rabbit"})
 *
 * @param {MessageSet<Params>} message
 *   The {@link string} message, series of {@link string[]} messages or a {@link MessageObj} that
 *   contains both the messages that should be formatted with the provided parameters and, in the
 *   case that the value is provided as a {@link MessageObj}, options that dictate details of how
 *   that formatting is done.
 *
 * @param {Params} parameters
 *   The parameters that should be injected into the provided message, {@link Message<Params>}.
 *
 * @param {types.InjectMessageOptions<Params>} options
 *   The options for injecting the parameters.
 *
 * @returns {string}
 */
export const formatMessage = <Params extends Record<string, unknown>>(
  message: types.MessageData,
  parameters?: Partial<Params> | undefined,
  options?: types.InjectMessageOptions<Params>,
): string => {
  const formatters = options?.formatters || ({} as types.MessageFormatters<Params>);
  const params: Partial<Params> = {
    ...options?.defaults,
    ...(parameters || ({} as Partial<Params>)),
  };

  const messages = Array.isArray(message) ? message : [message];
  if (messages.length === 0) {
    throw new Error("At least one formattable message must be provided, received 0.");
  }

  const _shouldRemoveParam = (p: keyof Params): boolean =>
    options?.removeUnformatted === true ||
    (options?.removeUnformatted !== undefined &&
      Array.isArray(options?.removeUnformatted) &&
      options.removeUnformatted.includes(p));

  const _doNotInject = (p: keyof Params) =>
    options?.doNotInject !== undefined &&
    options.doNotInject?.includes(params[p] as Params[keyof Params]);

  const info: _MessageInfo[] = messages.reduce((prev: _MessageInfo[], msg: string) => {
    // The parameter list will be empty if the string is not formatable.
    const parameterList = getStringFormatParams(msg);
    return [
      ...prev,
      {
        message: msg,
        /* Formattable parameters that are present in the string and the provided set of parameters
           should be injected as long as their associated values are not explicitly excluded. */
        inject: uniq([
          ...Object.keys(params).filter(
            (p: string) => parameterList.includes(p) && !_doNotInject(p),
          ),
        ]),
        /* When determining whether or not a parameter is missing, check if the parameter name is a
           key of the parameters object rather than checking 'params[paramName] === undefined',
           because we should support the injection of explicitly undefined values into the string.

           Parameters that will have their unformatted values removed should not count as missing.
           */
        missing: parameterList.filter(
          (p: string) =>
            (!Object.keys(params).includes(p) || _doNotInject(p)) && !_shouldRemoveParam(p),
        ),
        /* Formattable parameters that are not present in the set of provided parameters or are
           being explicitly excluded should be considered for removal if the options are configured
           as such. */
        remove: parameterList.filter(
          (p: string) =>
            (!Object.keys(params).includes(p) || _doNotInject(p)) && _shouldRemoveParam(p),
        ),
        // Keep track of which parameters are not being used for purposes of logging.
        unused:
          options?.ignoreUnused === true
            ? []
            : Object.keys(params).filter(
                (p: string) =>
                  !parameterList.includes(p) &&
                  (!Array.isArray(options?.ignoreUnused) || !options?.ignoreUnused.includes(p)),
              ),
      },
    ];
  }, []);

  /* Sort the provided messages based on which string will have the least amount of non-formattable
     parameters after the injection.  In other words, sort the messages based on the number of
     format parameters that are in the provided parameters.

     For instance, if we have two strings:
       (1) "The dog named :name went to school at :school.
       (2) "The dog named :name went to school somewhere.

    And the parameters are provided as { name: "Benji" }, string (2) should be the optimal choice
    because it will have the least amount of unformatted parameters leftover.
    */
  const optimized = info.sort(
    /* The array is guaranteed to have non-zero length because we safeguarded against the values
       that the function accepts having zero length. */
    (a: _MessageInfo, b: _MessageInfo) => a.missing.length - b.missing.length,
  );
  /* Unless explicitly provided as strict, when the optimal string cannot be completely formatted
     due to leftover formattable parameters that are not injected, the string will ignore the
     missing parameters and leave them unformatted (i.e. the resulting string will be, for instance,
    `The person named :name.`).  If strict is provided explicitly as true, an Error will be thrown.

     Note: If there are multiple optimal strings (i.e. more than 1 string that can be formatted with
     the same number of missing parameters), each will each have the same number of missing
     parameters - so all we have to do is check if the first optimal string has missing parameters.
     */
  if (optimized[0].missing.length !== 0) {
    const _message = [
      "In order to correctly format the value, it requires parameter(s) ",
      `'${optimized[0].missing.join(", ")}', which is/are not provided.`,
    ].join("");
    if (options?.strict === true) {
      throw new Error(_message);
      /* Parameters that are required in the optimal string but not provided should cause a warning
         to be logged by default. */
    } else if (options?.logMissing !== false) {
      logger.warn(
        {
          value: optimized[0].message,
          missing: JSON.stringify(optimized[0].missing),
          inject: JSON.stringify(optimized[0].inject),
        },
        _message,
      );
    }
  }
  /* If there are multiple optimal strings, each with the same number of missing parameters, as a
     second dimension optimize by the total number of parameters injected.  In other words, if two
     strings have 0 leftover unformattable parameters in the message after injection, choose the one
     that was able to inject the most parameters.

     Note: JS's native `.filter()` method preserves order for elements that match the filter, and
     because the first element in the optimized array will have the minimum number of missing
     elements, we can simply filter for the values that have that same optimal number of missing
     elements as the first, and then from that set return the one that has the most injected
     parameters.
     */
  const optimal = optimized
    .filter((v: _MessageInfo) => v.missing.length === optimized[0].missing.length)
    .sort((a: _MessageInfo, b: _MessageInfo) => b.inject.length - a.inject.length)[0];

  /* When determining what parameters (if any) were superfluously provided, don't just look at the
     unused parameters for the optimal value - because those parameters may have been applicable for
     another message that was not optimal.  Look at the parameters that were unused, or did not
     exist as a formattable param, for every message in the provided set. */
  const unused = info.map((v: _MessageInfo) => v.unused);
  if (!validators.validateAny(unused, (v: string[]) => v.length === 0)) {
    const unusedParameters = intersection(unused.filter((v: string[]) => v.length !== 0));
    if (unusedParameters.length !== 0) {
      logger.warn(
        {
          unusedParameters: JSON.stringify(unusedParameters),
          parameters: JSON.stringify(parameters),
          value: JSON.stringify(message),
        },
        `The provided parameter(s) '${unusedParameters.join(", ")}' do not exist in any of the ` +
          "provided string formattable values.",
      );
    }
  }
  /* Finally, inject the parameters that are present into the optimal string message.  If formatters
     are present, apply those to the applicable parameters. */
  const result = optimal.inject.reduce((prev: string, param: string) => {
    const fmt =
      formatters[param as keyof Params] ||
      ((v: Exclude<Params[keyof Params], undefined>) => String(v));
    const value = params[param as keyof Params];
    if (value !== undefined) {
      return prev.replaceAll(`:${param}`, fmt(value as Exclude<Params[keyof Params], undefined>));
    }
    return prev.replaceAll(`:${param}`, String(value));
  }, optimal.message);

  /* As a last step, remove applicable unformatted parameters and unnecessary whitespace that may
     have been introduced as a result of their removal. */
  return stringFormatters.toSentence(
    optimal.remove.reduce(
      (prev: string, param: string) => prev.replaceAll(`:${param}`, ""),
      result,
    ),
  );
};
