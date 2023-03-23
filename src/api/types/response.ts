import { errors } from "application";
import { model } from "lib";

import * as query from "./query";

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

/* export type ListResponse<T> = Omit<RawListResponse<T>, "next" | "previous"> & {
     readonly query: Http.ListQuery;
   };
   export type SuccessfulListResponse<T> = ListResponse<T>;
   export type FailedListResponse<T> = Omit<ListResponse<T>, "count" | "data"> & {
     readonly error: errors.HttpError;
   };
   export type RenderedListResponse<T> = SuccessfulListResponse<T> | FailedListResponse<T>; */

/* export type DetailResponse<T extends model.ApiModel> = T;
   export type SuccessfulDetailResponse<T extends model.ApiModel> = DetailResponse<T>;
   export type FailedDetailResponse = {
     readonly error: errors.HttpError;
   }; */

/* export type RenderedDetailResponse<T extends model.ApiModel> =
     | SuccessfulDetailResponse<T>
     | FailedDetailResponse; */

/* export type FailedTableResponse = {
     readonly error: errors.HttpError;
   }; */

export type TableResponse<M extends model.RowHttpModelType = model.RowHttpModelType> = {
  readonly models: M[];
  readonly groups?: model.Group[];
  readonly markups?: model.Markup[];
};

/* export type TableResponse<M extends model.RowHttpModelType = model.RowHttpModelType> =
     | FailedTableResponse
     | SuccessfulTableResponse<M>; */

export type MarkupResponseTypes<
  B extends model.BaseBudget,
  PARENT extends model.Account | model.SubAccount,
> = ParentChildResponse<B, model.Markup> | AncestryResponse<B, PARENT, model.Markup>;

export type ReorderResponse = { data: number[] };

export type ParentResponse<PARENT extends model.ApiModel> = {
  readonly parent: PARENT;
};

export type ParentChildResponse<
  PARENT extends model.ApiModel,
  CHILD extends model.ApiModel,
> = ParentResponse<PARENT> & {
  readonly data: CHILD;
};

export type AncestryResponse<
  GP extends model.ApiModel,
  PARENT extends model.ApiModel,
  CHILD extends model.ApiModel,
> = ParentChildResponse<PARENT, CHILD> & {
  readonly budget: GP;
};

export type ChildListResponse<CHILD extends model.ApiModel> = {
  readonly children: CHILD[];
};

export type ParentChildListResponse<
  PARENT extends model.ApiModel,
  CHILD extends model.ApiModel,
> = ParentResponse<PARENT> & ChildListResponse<CHILD>;

export type ParentsResponse<GP extends model.ApiModel, PARENT extends model.ApiModel> = {
  readonly budget: GP;
  readonly parent: PARENT;
};

export type AncestryListResponse<
  GP extends model.ApiModel,
  PARENT extends model.ApiModel,
  CHILD extends model.ApiModel,
> = ParentChildListResponse<PARENT, CHILD> & {
  readonly budget: GP;
};
