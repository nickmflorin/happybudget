declare namespace Http {
  type ErrorResponse = {
    readonly errors: Error[];
    readonly user_id?: number;
    readonly force_logout?: true;
  };

  interface ListResponse<T> {
    readonly count: number;
    readonly data: T[];
    readonly next?: string | null;
    readonly previous?: string | null;
  }

  type TableResponse<M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly models: M[];
    readonly groups?: Model.Group[];
    readonly markups?: Model.Markup[];
  };

  interface FileUploadResponse {
    readonly fileUrl: string;
  }

  type MarkupResponseTypes<B extends Model.Budget | Model.Template> =
    | BudgetContextDetailResponse<Model.Markup, B>
    | BudgetParentContextDetailResponse<Model.Markup, Model.Account, B>
    | BudgetParentContextDetailResponse<Model.Markup, Model.SubAccount, B>;

  type ReorderResponse = { data: number[] };

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

  type BulkModelResponse<M extends Model.HttpModel> = {
    readonly data: M[];
  };

  type BulkResponse<M extends Model.HttpModel, C extends Model.HttpModel> = {
    readonly data: M;
    readonly children: C[];
  };

  type BudgetBulkDeleteResponse<
    B extends Model.Budget | Model.Template,
    M extends Model.HttpModel
  > = BulkDeleteResponse<M> & {
    readonly budget: B;
  };

  type BudgetBulkResponse<
    B extends Model.Budget | Model.Template,
    M extends Model.HttpModel,
    C extends Model.HttpModel
  > = BulkResponse<M, C> & {
    readonly budget: B;
  };
}
