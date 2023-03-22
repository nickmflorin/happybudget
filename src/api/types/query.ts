export type Order = 1 | -1 | 0;

export type DefinitiveOrder = 1 | -1;

export type FieldOrder<F extends string = string> = {
  readonly field: F;
  readonly order: Order;
};

export type Ordering<F extends string = string> = FieldOrder<F>[];

export type QueryParamValue = string | number | boolean;
export type RawQuery = Record<string, QueryParamValue | undefined | null>;
export type ProcessedQuery = Record<string, QueryParamValue>;

type ListQuery = Omit<RawQuery, "ordering"> & {
  readonly ordering?: Ordering<string>;
  readonly ids?: number[];
  readonly exclude?: number[];
};
