/// <reference path="./payloads.d.ts" />
/// <reference path="./errors.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Http {
  type Method = "POST" | "PATCH" | "GET" | "DELETE";

  interface RequestOptions {
    readonly retries?: number;
    readonly ignoreForceLogout?: boolean;
    readonly headers?: { [key: string]: string };
    readonly cancelToken?: import("axios").CancelToken | undefined | null;
  }

  interface Query {
    [key: string]: any;
  }

  type PathParam = string | number;
  type PathParams = Array<PathParam>;

  type V1Url = `v1/${string}/`;

  type Order = 1 | -1 | 0;
  type Ordering = { [key: string]: Order };

  interface ListQuery extends Query {
    readonly ordering?: Ordering;
    readonly page?: number;
    readonly page_size?: number;
    readonly no_pagination?: string | number | boolean;
    readonly simple?: boolean;
    readonly search?: string;
  }
}
