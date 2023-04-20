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
  S = unknown,
  P extends Optional<FormatterParams<T, S>, "value"> = Optional<FormatterParams<T, S>, "value">,
> = P extends never ? never : P & BaseFormatterLaxOptions;

type BaseFormatterFallbackOptions<T> = {
  readonly fallbackValue: NonNullable<T>;
  readonly logError?: false;
  readonly errorPrefix?: string;
};

type FormatterFallbackOptions<
  T,
  S = unknown,
  P extends Optional<FormatterParams<T, S>, "value"> = Optional<FormatterParams<T, S>, "value">,
> = P extends never ? never : P & BaseFormatterFallbackOptions<T>;

export type LazyFormatterOptions<T> = BaseFormatterFallbackOptions<T> | BaseFormatterLaxOptions;

export type FormatterOptions<
  T,
  S = unknown,
  P extends FormatterParams<T, S> = FormatterParams<T, S>,
> =
  | (P & { readonly errorPrefix?: string })
  | FormatterFallbackOptions<T, S, P>
  | FormatterLaxOptions<T, S, P>;

export type NativeFormatterParams<S = unknown> = {
  readonly value: S;
};

export type TableFormatterParams<T> = tabling.TableValueFormatterParams<tabling.Row, string, T>;

export type FormatterParams<T, S> = NativeFormatterParams<S> | TableFormatterParams<T>;

export const formatterOptionsAreLax = <T, S, P extends FormatterParams<T, S>>(
  options: FormatterOptions<T, S, P>,
): options is FormatterLaxOptions<T, S, P> =>
  (options as FormatterLaxOptions<T, S, P>).strict === false;

export const formatterOptionsAreFallback = <T, S, P extends FormatterParams<T, S>>(
  options: FormatterOptions<T, S, P>,
): options is FormatterFallbackOptions<T, S, P> =>
  (options as FormatterFallbackOptions<T, S, P>).fallbackValue !== undefined;

export type FormatterReturn<
  OPTS extends LazyFormatterOptions<T> | FormatterOptions<T, S, P>,
  T,
  S = unknown,
  P extends FormatterParams<T, S> = FormatterParams<T, S>,
> = OPTS extends BaseFormatterLaxOptions
  ? T | null
  : OPTS extends BaseFormatterFallbackOptions<T>
  ? T
  : T;

type LazyFormatter<T, S = unknown> = {
  <Ol extends LazyFormatterOptions<T>>(options: Ol): (
    params: FormatterParams<T, S>,
  ) => FormatterReturn<Ol, T, S>;
};

export type Formatter<T, S = unknown> = {
  <O extends FormatterOptions<T, S, P>, P extends FormatterParams<T, S>>(
    options: O,
  ): FormatterReturn<O, T, S, P>;
  lazy: LazyFormatter<T, S>;
};

export function createFormatter<T, S = unknown>(
  schema: z.ZodType<T, z.ZodTypeDef, S>,
): Formatter<T, S> {
  const formatter = <O extends FormatterOptions<T, S, P>, P extends FormatterParams<T, S>>(
    options: O,
  ): FormatterReturn<O, T, S, P> => {
    const parsed = schema.safeParse(options.value);
    if (parsed.success) {
      return parsed.data as FormatterReturn<O, T, S, P>;
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
      return null as FormatterReturn<O, T, S, P>;
    } else if (formatterOptionsAreFallback(options)) {
      if (options.logError !== false) {
        logger.error({ e: err }, "");
      }
      return options.fallbackValue as FormatterReturn<O, T, S, P>;
    }
    throw err;
  };
  formatter.lazy =
    <Ol extends LazyFormatterOptions<T>>(options: Ol) =>
    (params: FormatterParams<T, S>) =>
      formatter({ ...options, ...params });
  return formatter;
}
