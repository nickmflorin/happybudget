declare namespace Http {
  type RawResponseValue = string | number | null;
  type Response = { [key: string]: RawResponseValue | Response | Response[] };

  type RawListResponse<T> = {
    readonly count: number;
    readonly data: T[];
    readonly next?: string | null;
    readonly previous?: string | null;
  };
  type ListResponse<T> = Omit<RawListResponse<T>, "next" | "previous"> & {
    readonly query: Http.ListQuery;
  };
  type SuccessfulListResponse<T> = ListResponse<T>;
  type FailedListResponse<T> = Omit<ListResponse<T>, "count" | "data"> & {
    readonly error: import("api").RequestError;
  };
  type RenderedListResponse<T> = SuccessfulListResponse<T> | FailedListResponse<T>;

  type DetailResponse<T extends Model.HttpModel> = T;
  type SuccessfulDetailResponse<T extends Model.HttpModel> = DetailResponse<T>;
  type FailedDetailResponse = {
    readonly error: import("api").RequestError;
  };
  type RenderedDetailResponse<T extends Model.HttpModel> = SuccessfulDetailResponse<T> | FailedDetailResponse;

  type FailedTableResponse = {
    readonly error: import("api").RequestError;
  };
  type SuccessfulTableResponse<M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly models: M[];
    readonly groups?: Model.Group[];
    readonly markups?: Model.Markup[];
  };
  type TableResponse<M extends Model.RowHttpModel = Model.RowHttpModel> =
    | FailedTableResponse
    | SuccessfulTableResponse<M>;

  type FileUploadResponse = {
    readonly fileUrl: string;
  };

  type MarkupResponseTypes<B extends Model.BaseBudget, PARENT extends Model.Account | Model.SubAccount> =
    | ParentChildResponse<B, Model.Markup>
    | AncestryResponse<B, PARENT, Model.Markup>;

  type ReorderResponse = { data: number[] };

  type ParentResponse<PARENT extends Model.HttpModel> = {
    readonly parent: PARENT;
  };

  type ParentChildResponse<PARENT extends Model.HttpModel, CHILD extends Model.HttpModel> = ParentResponse<PARENT> & {
    readonly data: CHILD;
  };

  type AncestryResponse<
    GP extends Model.HttpModel,
    PARENT extends Model.HttpModel,
    CHILD extends Model.HttpModel
  > = ParentChildResponse<PARENT, CHILD> & {
    readonly budget: GP;
  };

  type ChildListResponse<CHILD extends Model.HttpModel> = {
    readonly children: CHILD[];
  };

  type ParentChildListResponse<PARENT extends Model.HttpModel, CHILD extends Model.HttpModel> = ParentResponse<PARENT> &
    ChildListResponse<CHILD>;

  type ParentsResponse<GP extends Model.HttpModel, PARENT extends Model.HttpModel> = {
    readonly budget: GP;
    readonly parent: PARENT;
  };

  type AncestryListResponse<
    GP extends Model.HttpModel,
    PARENT extends Model.HttpModel,
    CHILD extends Model.HttpModel
  > = ParentChildListResponse<PARENT, CHILD> & {
    readonly budget: GP;
  };
}
