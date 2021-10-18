/// <reference path="./payloads.d.ts" />
/// <reference path="./errors.d.ts" />

/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
namespace Http {
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ErrorResponse = {
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    readonly errors: Http.Error[];
    readonly user_id?: number;
    readonly force_logout?: true;
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
  interface FileUploadResponse {
    readonly fileUrl: string;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type MarkupResponseTypes<B extends Model.Budget | Model.Template> =
    | BudgetContextDetailResponse<Model.Markup, B>
    | BudgetParentContextDetailResponse<Model.Markup, Model.Account, B>
    | BudgetParentContextDetailResponse<Model.Markup, Model.SubAccount, B>;

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
