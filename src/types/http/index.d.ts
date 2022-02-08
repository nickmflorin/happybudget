declare namespace Http {
  type Method = "POST" | "PATCH" | "GET" | "DELETE";

  type RequestOptions = {
    readonly timeout?: number;
    readonly headers?: { [key: string]: string };
    readonly cancelToken?: import("axios").CancelToken | undefined;
  };

  type RawQuery = {
    readonly page_size?: number;
    readonly page?: number;
    readonly search?: string;
    readonly simple?: boolean;
    readonly ordering?: string;
  };

  type TokenType = "email-confirmation" | "password-recovery";

  type PathParam = string | number;

  type PathParams = Array<PathParam>;

  type V1Url = `v1/${string}/`;

  type Order = 1 | -1 | 0;
  type DefinitiveOrder = 1 | -1;
  type FieldOrder<F extends string = string> = {
    readonly field: F;
    readonly order: Order;
  };

  type Ordering<F extends string = string> = FieldOrder<F>[];

  type ListQuery<O extends string = string> = Omit<RawQuery, "ordering"> & {
    readonly ordering?: Ordering<O>;
  };

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type Service<T> = (...args: any[]) => T;
}
