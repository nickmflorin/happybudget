import { Optional } from "utility-types";
import { z } from "zod";

import { errors } from "application";
import { logger } from "internal";

import * as tabling from "../../tabling";

type BaseFormatterLaxOptions = {
  readonly strict: false;
  readonly logError?: false;
  readonly errorPrefix?: string;
};

type FormatterLaxOptions<
  T,
  P extends Optional<FormatterParams<T>, "value"> = Optional<FormatterParams<T>, "value">,
> = P extends never ? never : P & BaseFormatterLaxOptions;

type BaseFormatterFallbackOptions<T> = {
  readonly fallbackValue: NonNullable<T>;
  readonly logError?: false;
  readonly errorPrefix?: string;
};

type FormatterFallbackOptions<
  T,
  P extends Optional<FormatterParams<T>, "value"> = Optional<FormatterParams<T>, "value">,
> = P extends never ? never : P & BaseFormatterFallbackOptions<T>;

export type LazyFormatterOptions<T> = BaseFormatterFallbackOptions<T> | BaseFormatterLaxOptions;

export type FormatterOptions<T, P extends FormatterParams<T> = FormatterParams<T>> =
  | (P & { readonly errorPrefix?: string })
  | FormatterFallbackOptions<T, P>
  | FormatterLaxOptions<T, P>;

export type NativeFormatterParams = {
  readonly value: unknown;
};

export type TableFormatterParams<T> = tabling.TableValueFormatterParams<tabling.Row, string, T>;

export type FormatterParams<T> = NativeFormatterParams | TableFormatterParams<T>;

export const formatterOptionsAreLax = <T, P extends FormatterParams<T>>(
  options: FormatterOptions<T, P>,
): options is FormatterLaxOptions<T, P> => (options as FormatterLaxOptions<T, P>).strict === false;

export const formatterOptionsAreFallback = <T, P extends FormatterParams<T>>(
  options: FormatterOptions<T, P>,
): options is FormatterFallbackOptions<T, P> =>
  (options as FormatterFallbackOptions<T, P>).fallbackValue !== undefined;

export type FormatterReturn<
  OPTS extends LazyFormatterOptions<T> | FormatterOptions<T, P>,
  T,
  P extends FormatterParams<T> = FormatterParams<T>,
> = OPTS extends BaseFormatterLaxOptions
  ? T | null
  : OPTS extends BaseFormatterFallbackOptions<T>
  ? T
  : T;

type LazyFormatter<T> = {
  <Ol extends LazyFormatterOptions<T>>(options: Ol): (
    params: FormatterParams<T>,
  ) => FormatterReturn<Ol, T>;
};

export type Formatter<T> = {
  <O extends FormatterOptions<T, P>, P extends FormatterParams<T>>(options: O): FormatterReturn<
    O,
    T,
    P
  >;
  lazy: LazyFormatter<T>;
};

export function createFormatter<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>): Formatter<T> {
  const formatter = <O extends FormatterOptions<T, P>, P extends FormatterParams<T>>(
    options: O,
  ): FormatterReturn<O, T, P> => {
    const parsed = schema.safeParse(options.value);
    if (parsed.success) {
      return parsed.data as FormatterReturn<O, T, P>;
    }
    const err = new errors.MalformedDataSchemaError({
      error: parsed.error,
      prefix: options.errorPrefix,
      value: options.value,
    });
    if (formatterOptionsAreLax(options)) {
      if (options.logError !== false) {
        logger.error({ e: err }, "");
      }
      return null as FormatterReturn<O, T, P>;
    } else if (formatterOptionsAreFallback(options)) {
      if (options.logError !== false) {
        logger.error({ e: err }, "");
      }
      return options.fallbackValue as FormatterReturn<O, T, P>;
    }
    throw err;
  };
  formatter.lazy =
    <Ol extends LazyFormatterOptions<T>>(options: Ol) =>
    (value: unknown) =>
      formatter({ ...options, value });
  return formatter;
}
