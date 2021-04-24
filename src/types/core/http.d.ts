/// <reference path="./modeling.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Http {

  type Method = "POST" | "PATCH" | "GET" | "DELETE";

  interface RequestOptions extends AxiosRequestConfig {
    retries?: number;
    headers?: { [key: string]: string };
    cancelToken?: any;
  }

  interface Query {
    [key: string]: any;
  }

  type Order = 1 | -1 | 0;
  type Ordering = { [key: string]: Http.Order };

  interface ListQuery extends Http.Query {
    readonly ordering?: Http.Ordering;
    readonly page?: number;
    readonly page_size?: number;
    readonly no_pagination?: string | number | boolean;
    readonly search?: string;
  }

  type ModelPayload<M extends Model.Model> = {
    [key in keyof Omit<M, "id">]?: any;
  }

  interface ListResponse<T> {
    readonly count: number;
    readonly data: T[];
    readonly next?: string | null;
    readonly previous?: string | null;
  }

  type ErrorType = "unknown" | "http" | "field" | "global" | "auth";

  interface ErrorInterface {
    readonly error_type: Http.ErrorType;
    readonly code: string;
    readonly message: string;
  }

  interface BaseError {
    readonly code: string;
    readonly message: string;
  }

  interface UnknownError extends BaseError implements Http.ErrorInterface {
    readonly error_type: "unknown";
  }

  interface FieldError extends BaseError implements Http.ErrorInterface {
    readonly error_type: "field";
    readonly field: string;
    readonly code: "unique" | "invalid" | "required";
  }

  interface GlobalError extends BaseError implements Http.ErrorInterface {
    readonly error_type: "global";
  }

  interface HttpError extends BaseError implements Http.ErrorInterface {
    readonly error_type: "http";
  }

  interface AuthError extends BaseError implements Http.ErrorInterface {
    readonly error_type: "auth";
    readonly force_logout?: boolean;
  }

  type Error = Http.HttpError | Http.UnknownError | Http.FieldError | Http.GlobalError | Http.AuthError;

  type ErrorResponse = {
    errors: Http.Error[];
    [key: string]: any;
  };

  interface TokenValidationResponse {
    readonly user: Model.User;
  }

  interface SocialPayload {
    readonly token_id: string;
    readonly provider: string;
  }

  interface RegistrationPayload {
    readonly first_name: string;
    readonly last_name: string;
    readonly email: string;
    readonly password: string;
  }

  interface UserPayload {
    readonly first_name: string;
    readonly last_name: string;
    readonly profile_image: File | Blob | null;
  }

  interface LoginResponse {
    readonly detail: string;
  }

  interface FileUploadResponse {
    readonly fileUrl: string;
  }

  interface FringePayload implements Http.ModelPayload<Model.Fringe> {
    readonly name: string;
    readonly description?: string | null;
    readonly cutoff?: number | null;
    readonly rate: number;
    readonly unit?: Model.FringeUnit;
  }

  interface BudgetPayload implements Http.ModelPayload<Model.Budget> {
    readonly production_type?: Model.ProductionTypeId;
    readonly name: string;
    readonly template?: number;
    readonly image?: string | ArrayBuffer | null;
  }

  interface TemplatePayload implements Http.ModelPayload<Model.Template> {
    readonly name: string;
    readonly image?: string | ArrayBuffer | null;
  }

  interface GroupPayload implements Http.ModelPayload<Model.Group> {
    readonly name: string;
    readonly children?: number[];
    readonly color: string;
  }

  interface AccountPayload implements Http.ModelPayload<Model.Account> {
    readonly description?: string;
    readonly group?: number | null;
  }

  interface BudgetAccountPayload extends AccountPayload {
    readonly access?: number[];
  }

  interface TemplateAccountPayload extends AccountPayload {}

  interface SubAccountPayload implements Http.ModelPayload<Model.SubAccount> {
    readonly description?: string;
    readonly name: string;
    readonly line: string;
    readonly quantity?: number;
    readonly rate?: number;
    readonly multiplier?: number;
    readonly unit?: Model.SubAccountUnitId;
    readonly group?: number | null;
  }

  interface ActualPayload implements Http.ModelPayload<Model.Actual> {
    readonly description?: string;
    readonly date?: string;
    readonly vendor?: string;
    readonly purchase_order?: string;
    readonly payment_id?: string;
    readonly value?: number;
    readonly payment_method?: Model.PaymentMethodId;
    readonly object_id?: number;
    readonly parent_type?: "account" | "subaccount";
  }

  interface CommentPayload implements Http.ModelPayload<Model.Comment> {
    readonly likes?: number[];
    readonly text: string;
  }

  interface ContactPayload implements Http.ModelPayload<Model.Contact> {
    readonly first_name: string;
    readonly last_name: string;
    readonly email: string;
    readonly role: Model.ContactRoleId;
    readonly city: string;
    readonly country: string;
    readonly phone_number: string;
    readonly email: string;
  }

  interface BulkUpdatePayload<T extends Http.ModelPayload> extends Partial<T> {
    readonly id: number;
  }

  interface BulkCreateResponse<M extends Model.Model> {
    data: M[];
  }
}
