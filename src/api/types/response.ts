import { model } from "lib";

export type RawResponseValue = string | number | null;
export type Response = { [key: string]: RawResponseValue | Response | Response[] };

export type FileUploadResponse = {
  readonly fileUrl: string;
};

export type RawListResponse<T> = {
  readonly count: number;
  readonly data: T[];
  readonly next?: string | null;
  readonly previous?: string | null;
};
export type ListResponse<T> = Omit<RawListResponse<T>, "next" | "previous"> & {
  readonly query: Http.ListQuery;
};
export type SuccessfulListResponse<T> = ListResponse<T>;
export type FailedListResponse<T> = Omit<ListResponse<T>, "count" | "data"> & {
  readonly error: import("api").RequestError;
};
export type RenderedListResponse<T> = SuccessfulListResponse<T> | FailedListResponse<T>;

export type DetailResponse<T extends model.HttpModel> = T;
export type SuccessfulDetailResponse<T extends model.HttpModel> = DetailResponse<T>;
export type FailedDetailResponse = {
  readonly error: import("api").RequestError;
};
export type RenderedDetailResponse<T extends model.HttpModel> =
  | SuccessfulDetailResponse<T>
  | FailedDetailResponse;

export type FailedTableResponse = {
  readonly error: import("api").RequestError;
};
export type SuccessfulTableResponse<M extends model.RowHttpModel = model.RowHttpModel> = {
  readonly models: M[];
  readonly groups?: model.Group[];
  readonly markups?: model.Markup[];
};
export type TableResponse<M extends model.RowHttpModel = model.RowHttpModel> =
  | FailedTableResponse
  | SuccessfulTableResponse<M>;

export type MarkupResponseTypes<
  B extends model.BaseBudget,
  PARENT extends model.Account | model.SubAccount,
> = ParentChildResponse<B, model.Markup> | AncestryResponse<B, PARENT, model.Markup>;

export type ReorderResponse = { data: number[] };

export type ParentResponse<PARENT extends model.HttpModel> = {
  readonly parent: PARENT;
};

export type ParentChildResponse<
  PARENT extends model.HttpModel,
  CHILD extends model.HttpModel,
> = ParentResponse<PARENT> & {
  readonly data: CHILD;
};

export type AncestryResponse<
  GP extends model.HttpModel,
  PARENT extends model.HttpModel,
  CHILD extends model.HttpModel,
> = ParentChildResponse<PARENT, CHILD> & {
  readonly budget: GP;
};

export type ChildListResponse<CHILD extends model.HttpModel> = {
  readonly children: CHILD[];
};

export type ParentChildListResponse<
  PARENT extends model.HttpModel,
  CHILD extends model.HttpModel,
> = ParentResponse<PARENT> & ChildListResponse<CHILD>;

export type ParentsResponse<GP extends model.HttpModel, PARENT extends model.HttpModel> = {
  readonly budget: GP;
  readonly parent: PARENT;
};

export type AncestryListResponse<
  GP extends model.HttpModel,
  PARENT extends model.HttpModel,
  CHILD extends model.HttpModel,
> = ParentChildListResponse<PARENT, CHILD> & {
  readonly budget: GP;
};
