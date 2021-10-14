/// <reference path="./payloads.d.ts" />
/// <reference path="./errors.d.ts" />

/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
namespace Http {
  type NonModelPayloadFields = "created_at" | "updated_at" | "created_by" | "updated_by" | "id" | "type";

  type Payload = { [key: string]: any };

  type ModelPayload<M extends Model.Model> = {
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    [key in keyof Omit<M, NonModelPayloadFields>]?: any;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface ListResponse<T> {
    readonly count: number;
    readonly data: T[];
    readonly next?: string | null;
    readonly previous?: string | null;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type TableResponse<M extends Model.TypedHttpModel = Model.TypedHttpModel> = {
    readonly models: M[];
    readonly groups?: Model.Group[];
    readonly markups?: Model.Markup[];
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface TokenValidationResponse {
    readonly user: Model.User;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface SocialPayload {
    readonly token_id: string;
    readonly provider: string;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface RegistrationPayload {
    readonly first_name: string;
    readonly last_name: string;
    readonly email: string;
    readonly password: string;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface UserPayload {
    readonly first_name: string;
    readonly last_name: string;
    readonly profile_image?: string | ArrayBuffer | null;
    readonly timezone?: string;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface FileUploadResponse {
    readonly fileUrl: string;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface FringePayload {
    readonly name: string;
    readonly description?: string | null;
    readonly cutoff?: number | null;
    readonly rate: number;
    readonly unit?: Model.FringeUnit;
    readonly color?: string | null;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type MarkupResponseTypes<B extends Model.Budget | Model.Template> =
    | BudgetContextDetailResponse<Model.Markup, B>
    | BudgetParentContextDetailResponse<Model.Markup, Model.Account, B>
    | BudgetParentContextDetailResponse<Model.Markup, Model.SubAccount, B>;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface MarkupPayload {
    readonly identifier?: string | null;
    readonly description?: string | null;
    readonly unit?: Model.MarkupUnitId | null;
    readonly rate?: number | null;
    readonly children?: number[];
    readonly groups?: number[];
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface ModifyMarkupPayload {
    readonly children?: number[];
    readonly groups?: number[];
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface BudgetPayload {
    readonly production_type?: Model.ProductionTypeId;
    readonly name: string;
    readonly template?: number;
    readonly image?: string | ArrayBuffer | null;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface TemplatePayload {
    readonly name: string;
    readonly image?: string | ArrayBuffer | null;
    readonly community?: boolean;
    readonly hidden?: boolean;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface GroupPayload {
    readonly name?: string;
    readonly color?: string;
    readonly children?: number[];
    readonly children_markups?: number[];
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface AccountPayload extends ModelPayload<Model.Account> {
    readonly group?: number | null;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type SubAccountPayload = Omit<ModelPayload<Model.SubAccount>, "unit"> & {
    readonly unit?: number | null;
    readonly group?: number | null;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface ActualPayload extends Omit<ModelPayload<Model.Actual>, "owner" | "actual_type"> {
    readonly actual_type?: number | null;
    readonly owner?: Model.GenericHttpModel<"subaccount"> | Model.GenericHttpModel<"markup"> | null;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface CommentPayload {
    readonly likes?: number[];
    readonly text: string;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface HeaderTemplatePayload extends ModelPayload<Model.HeaderTemplate> {
    readonly left_image?: string | ArrayBuffer | null;
    readonly right_image?: string | ArrayBuffer | null;
    readonly original?: number;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface ContactPayload {
    readonly type?: Model.ContactTypeId | null;
    readonly first_name?: string | null;
    readonly last_name?: string | null;
    readonly company?: string | null;
    readonly position?: string | null;
    readonly city?: string | null;
    readonly email?: string | null;
    readonly phone_number?: string | null;
    readonly rate?: number | null;
    readonly image?: ArrayBuffer | string | null;
  }

  type BudgetContextDetailResponse<
    M extends Model.HttpModel,
    B extends Model.Budget | Model.Template = Model.Budget
  > = {
    readonly data: M;
    readonly budget: B;
  };

  type BudgetParentContextDetailResponse<
    M extends Model.HttpModel,
    P extends Model.Account | Model.SubAccount,
    B extends Model.Budget | Model.Template = Model.Budget
  > = {
    readonly data: M;
    readonly budget: B;
    readonly parent: P;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type BulkCreatePayload<T extends Payload> = { data: Partial<T>[] };
  type ModelBulkUpdatePayload<T extends Payload> = (Partial<T> | {}) & { readonly id: number };
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type BulkUpdatePayload<T extends Payload> = { data: ModelBulkUpdatePayload<T>[] };

  type BulkDeleteResponse<M extends Model.HttpModel> = {
    readonly data: M;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type BulkModelResponse<M extends Model.HttpModel> = {
    readonly data: M[];
  };

  type BulkResponse<M extends Model.HttpModel, C extends Model.HttpModel> = {
    readonly data: M;
    readonly children: C[];
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type BudgetBulkDeleteResponse<
    B extends Model.Budget | Model.Template,
    M extends Model.HttpModel
  > = BulkDeleteResponse<M> & {
    readonly budget: B;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type BudgetBulkResponse<
    B extends Model.Budget | Model.Template,
    M extends Model.HttpModel,
    C extends Model.HttpModel
  > = BulkResponse<M, C> & {
    readonly budget: B;
  };
}
