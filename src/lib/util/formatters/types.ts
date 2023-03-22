import { Moment } from "moment";

export type FormatType = "currency" | "percentage" | "phoneNumber" | "date";

export type NaiveOnFormatError<
  P extends string | number | import("moment").Moment = string | number,
> = (v: P) => string | void;

export type OnFormatError<P extends string | number | import("moment").Moment = string | number> = (
  v: P,
) => void;

export type AGFormatterParams = import("ag-grid-community").ValueFormatterParams;
export type AGFormatter = (params: AGFormatterParams) => string;

export type NativeFormatterParams<
  P extends string | number | import("moment").Moment = string | number,
> = P | null;
export type NativeFormatter<P extends string | number | import("moment").Moment = string | number> =
  (params: NativeFormatterParams<P>, onError?: OnFormatError) => string;

export type FormatterCalbackOpts<T extends string | number | Moment = string | number> = {
  readonly onError: OnFormatError<T>;
};

export type FormatterErrorValueOpts = {
  readonly errorValue: string;
};

export type FormatterOpts<T extends string | number | Moment = string | number> =
  | FormatterCalbackOpts<T>
  | FormatterErrorValueOpts;

export type FormatterParams<T extends string | number | import("moment").Moment = string | number> =
  AGFormatterParams | NativeFormatterParams<T>;

export type Formatter<T extends string | number | import("moment").Moment = string | number> = (
  params: FormatterParams<T>,
) => string;
