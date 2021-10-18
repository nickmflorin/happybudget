/// <reference path="./payloads.d.ts" />
/// <reference path="./errors.d.ts" />
/// <reference path="./response.d.ts" />

/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
namespace Http {
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Method = "POST" | "PATCH" | "GET" | "DELETE";

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface RequestOptions {
    readonly retries?: number;
    readonly headers?: { [key: string]: string };
    readonly cancelToken?: import("axios").CancelToken | undefined | null;
  }

  interface Query {
    [key: string]: any;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type TokenType = "email-confirmation" | "password-recovery";

  type PathParam = string | number;
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type PathParams = Array<PathParam>;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type V1Url = `v1/${string}/`;

  type Order = 1 | -1 | 0;
  type Ordering = { [key: string]: Order };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface ListQuery extends Query {
    readonly ordering?: Ordering;
    readonly page?: number;
    readonly page_size?: number;
    readonly no_pagination?: string | number | boolean;
    readonly simple?: boolean;
    readonly search?: string;
  }
}
