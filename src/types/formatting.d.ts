declare type FormatType = "currency" | "percentage" | "phoneNumber" | "date";

declare type NaiveOnFormatError<
  P extends string | number | import("moment").Moment = string | number,
> = (v: P) => string | void;

declare type OnFormatError<P extends string | number | import("moment").Moment = string | number> =
  (v: P) => void;

declare type AGFormatterParams = import("@ag-grid-community/core").ValueFormatterParams;
declare type AGFormatter = (params: AGFormatterParams) => string;

declare type NativeFormatterParams<
  P extends string | number | import("moment").Moment = string | number,
> = P | null;
declare type NativeFormatter<
  P extends string | number | import("moment").Moment = string | number,
> = (params: NativeFormatterParams<P>, onError?: OnFormatError) => string;

declare type FormatterCalbackOpts<T extends string | number | Moment = string | number> = {
  readonly onError: OnFormatError<T>;
};

declare type FormatterErrorValueOpts = {
  readonly errorValue: string;
};

declare type FormatterOpts<T extends string | number | Moment = string | number> =
  | FormatterCalbackOpts<T>
  | FormatterErrorValueOpts;

declare type FormatterParams<
  T extends string | number | import("moment").Moment = string | number,
> = AGFormatterParams | NativeFormatterParams<T>;

declare type Formatter<T extends string | number | import("moment").Moment = string | number> = (
  params: FormatterParams<T>,
) => string;
