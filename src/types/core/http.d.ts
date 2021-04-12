/// <reference path="./modeling.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Http {

  type Method = "POST" | "PATCH" | "GET" | "DELETE";

  interface IRequestOptions extends AxiosRequestConfig {
    retries?: number;
    headers?: { [key: string]: string };
    cancelToken?: any;
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

  type ModelPayload<M extends Model> = {
    [key in keyof Omit<M, "id">]?: any;
  }

  interface IListResponse<T> {
    readonly count: number;
    readonly data: T[];
    readonly next?: string | null;
    readonly previous?: string | null;
  }

  type ErrorType = "unknown" | "http" | "field" | "global" | "auth";

  interface ErrorInterface {
    readonly error_type: ErrorType;
    readonly code: string;
    readonly message: string;
  }

  interface BaseError {
    readonly code: string;
    readonly message: string;
  }

  interface UnknownError extends BaseError implements ErrorInterface {
    readonly error_type: "unknown";
  }

  interface FieldError extends BaseError implements ErrorInterface {
    readonly error_type: "field";
    readonly field: string;
    readonly code: "unique" | "invalid" | "required";
  }

  interface GlobalError extends BaseError implements ErrorInterface {
    readonly error_type: "global";
  }

  interface HttpError extends BaseError implements ErrorInterface {
    readonly error_type: "http";
  }

  interface AuthError extends BaseError implements ErrorInterface {
    readonly error_type: "auth";
    readonly force_logout?: boolean;
  }

  type Error = HttpError | UnknownError | FieldError | GlobalError | AuthError;

  type ErrorResponse = {
    errors: Error[];
    [key: string]: any;
  };

  interface ITokenValidationResponse {
    readonly user: IUser;
  }

  interface ISocialPayload {
    readonly token_id: string;
    readonly provider: string;
  }

  interface IRegistrationPayload {
    readonly first_name: string;
    readonly last_name: string;
    readonly email: string;
    readonly password: string;
  }

  interface IUserPayload {
    readonly first_name: string;
    readonly last_name: string;
    readonly profile_image: File | Blob | null;
  }

  interface ILoginResponse {
    readonly detail: string;
  }

  interface IFileUploadResponse {
    readonly fileUrl: string;
  }

  interface IFringePayload implements ModelPayload<IFringe> {
    readonly name: string;
    readonly description?: string | null;
    readonly cutoff?: number | null;
    readonly rate: number;
    readonly unit?: FringeUnit;
  }

  interface IBudgetPayload implements ModelPayload<IBudget> {
    readonly production_type: ProductionType;
    readonly name: string;
  }

  interface IGroupPayload implements ModelPayload<IGroup> {
    readonly name: string;
    readonly children?: number[];
    readonly color: string;
  }

  interface IAccountPayload implements ModelPayload<IAccount> {
    readonly account_number: string;
    readonly description?: string;
    readonly access?: number[];
    readonly group?: number | null;
  }

  interface ISubAccountPayload implements ModelPayload<ISubAccount> {
    readonly description?: string;
    readonly name: string;
    readonly line: string;
    readonly quantity?: number;
    readonly rate?: number;
    readonly multiplier?: number;
    readonly unit?: SubAccountUnitId;
    readonly group?: number | null;
  }

  interface IActualPayload implements ModelPayload<IActual> {
    readonly description?: string;
    readonly date?: string;
    readonly vendor?: string;
    readonly purchase_order?: string;
    readonly payment_id?: string;
    readonly value?: number;
    readonly payment_method?: PaymentMethod;
    readonly object_id?: number;
    readonly parent_type?: BudgetItemType;
  }

  interface ICommentPayload implements ModelPayload<IComment> {
    readonly likes?: number[];
    readonly text: string;
  }

  interface IContactPayload implements ModelPayload<IContact> {
    readonly first_name: string;
    readonly last_name: string;
    readonly email: string;
    readonly role: Role;
    readonly city: string;
    readonly country: string;
    readonly phone_number: string;
    readonly email: string;
  }

  interface ISubAccountBulkUpdatePayload extends Partial<ISubAccountPayload> {
    readonly id: number;
  }

  interface IAccountBulkUpdatePayload extends Partial<IAccountPayload> {
    readonly id: number;
  }

  interface IActualBulkUpdatePayload extends Partial<IActualPayload> {
    readonly id: number;
  }

  interface IFringeBulkUpdatePayload extends Partial<IFringePayload> {
    readonly id: number;
  }

  interface IBulkCreateSubAccountsResponse {
    data: ISubAccount[];
  }

  interface IBulkCreateFringesResponse {
    data: IFringe[];
  }

  interface IBulkCreateAccountsResponse {
    data: IAccount[];
  }
}
