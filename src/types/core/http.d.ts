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

  interface IPayload {}

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

  interface ISocialPayload {
    readonly token_id: string;
    readonly provider: string;
  }

  interface ILoginResponse {
    readonly detail: string;
  }

  interface IBudgetPayload extends IPayload {
    readonly production_type: ProductionType;
    readonly name: string;
  }

  // TODO: Instead of allowing partial fields to be undefined on the
  // model, maybe we should instead have a set of required fields and
  // only create the account when all of those fields are present.
  interface IAccountPayload extends IPayload {
    readonly account_number: string;
    readonly description?: string;
    readonly access?: number[];
  }

  // TODO: Instead of allowing partial fields to be undefined on the
  // model, maybe we should instead have a set of required fields and
  // only create the sub account when all of those fields are present.
  interface ISubAccountPayload extends IPayload {
    readonly description?: string;
    readonly name: string;
    readonly line: string;
    readonly quantity?: number;
    readonly rate?: number;
    readonly multiplier?: number;
    readonly unit?: number;
  }
}
