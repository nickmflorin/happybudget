declare namespace Http {
  type RawResponseValue = string | number | null;
  type Response = { [key: string]: RawResponseValue | Response | Response[] };

  type ListResponse<T> = {
    readonly count: number;
    readonly data: T[];
    readonly next?: string | null;
    readonly previous?: string | null;
  };

  type TableResponse<M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly models: M[];
    readonly groups?: Model.Group[];
    readonly markups?: Model.Markup[];
  };

  type FileUploadResponse = {
    readonly fileUrl: string;
  };

  type MarkupResponseTypes<B extends Model.BaseBudget> =
    | ParentChildResponse<B, Model.Markup>
    | AncestryResponse<B, Model.Account, Model.Markup>
    | AncestryResponse<B, Model.SubAccount, Model.Markup>;

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
