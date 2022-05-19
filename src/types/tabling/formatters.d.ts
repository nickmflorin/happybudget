declare namespace Table {
  type AGFormatterParams = import("@ag-grid-community/core").ValueFormatterParams;
  type AGFormatter = (params: AGFormatterParams) => string;

  type NativeFormatterParams<P> = P | null;
  type NativeFormatter<P> = (params: NativeFormatterParams<P>, onError?: OnFormatError) => string;

  type FormatterParams<T = string | number> = Table.AGFormatterParams | Table.NativeFormatterParams<T>;
  type Formatter<T = string | number> = (params: FormatterParams<T>) => string;
}
