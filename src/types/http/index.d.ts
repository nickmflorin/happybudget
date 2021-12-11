declare namespace Http {
  type Method = "POST" | "PATCH" | "GET" | "DELETE";

  interface RequestOptions {
    readonly retries?: number;
    readonly headers?: { [key: string]: string };
    readonly cancelToken?: import("axios").CancelToken | undefined | null;
  }

  interface Query {
    [key: string]: any;
  }

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

  /* eslint-disable-next-line no-unused-vars */
  type Ordering<F extends string = string> = FieldOrder<F>[];

  type ListQuery<O extends string = string> = {
    readonly ordering?: Ordering<O>;
    readonly page?: number;
    readonly page_size?: number;
    readonly simple?: boolean;
    readonly search?: string;
  };

  type Service<T = any> = (...args: any[]) => T;
}
