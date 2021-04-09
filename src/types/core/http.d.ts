/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Http {
  interface IRequestOptions extends AxiosRequestConfig {
    retries?: number;
    headers?: { [key: string]: string };
    redirectOnAuthenticationError?: boolean;
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

  interface IPayload {}

  interface IListResponse<T> {
    readonly count: number;
    readonly data: T[];
    readonly next?: string | null;
    readonly previous?: string | null;
  }

  type IErrorDetail = {
    readonly message: string;
    // TODO: We might want to map this to the specific error codes we have defined.
    readonly code: string;
  };

  type IFieldErrors = {
    readonly [key: string]: IErrorDetail[];
  };

  type IErrors = {
    // These are global errors that do not pertain to a specific field of the payload.
    readonly __all__?: IErrorDetail[];
    [key: string]: IErrorDetail[] | IFieldErrors;
  };

  type IErrorsResponse = {
    errors: IErrors;
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

  interface IFringePayload extends IPayload {
    readonly name: string;
    readonly description?: string | null;
    readonly cutoff?: number | null;
    readonly rate: number;
    readonly unit?: FringeUnit;
  }

  interface IBudgetPayload extends IPayload {
    readonly production_type: ProductionType;
    readonly name: string;
  }

  interface IGroupPayload extends IPayload {
    readonly name: string;
    readonly children?: number[];
    readonly color: string;
  }

  interface IAccountPayload extends IPayload {
    readonly account_number: string;
    readonly description?: string;
    readonly access?: number[];
    readonly group?: number | null;
  }

  interface ISubAccountPayload extends IPayload {
    readonly description?: string;
    readonly name: string;
    readonly line: string;
    readonly quantity?: number;
    readonly rate?: number;
    readonly multiplier?: number;
    readonly unit?: SubAccountUnit;
    readonly group?: number | null;
  }

  interface IActualPayload extends IPayload {
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

  interface ICommentPayload extends IPayload {
    readonly likes?: number[];
    readonly text: string;
  }

  interface IContactPayload extends IPayload {
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
