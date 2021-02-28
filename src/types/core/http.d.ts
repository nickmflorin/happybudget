// import { AxiosRequestConfig } from "axios";

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Http {
  interface IRequestOptions extends AxiosRequestConfig {
    retries?: number;
    headers?: { [key: string]: string };
    signal?: any;
    redirectOnAuthenticationError?: boolean;
  }

  interface IQuery {
    [key: string]: any;
  }

  type Order = 1 | -1 | 0;

  type Ordering = { [key: string]: Order };

  interface IListQuery extends IQuery {
    readonly ordering?: Ordering;
    readonly page?: number;
    readonly page_size?: number;
    readonly no_pagination?: string | number | boolean;
    readonly search?: string;
  }

  interface IPayload {
    [key: string]: any;
  }

  interface IListResponse<T> {
    readonly count: number;
    readonly data: T[];
    readonly next?: string | null;
    readonly previous?: string | null;
  }

  interface IErrorDetail {
    readonly message: string;
    readonly code: string;
  }

  interface ITokenValidationResponse {
    readonly user: IUser;
  }

  interface ILoginResponse {
    readonly detail: string;
  }
}
