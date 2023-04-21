import { schemas } from "lib";

export type FileUploadResponse = {
  readonly fileUrl: string;
};

export type ApiResponseBody = schemas.Json;

/**
 * The form of the JSON body for responses rendered on the server when the request is successful.
 */
export type ApiSuccessResponse<D extends ApiResponseBody = ApiResponseBody> = D;

export type ListResponseIteree = schemas.Json;

export type ApiListResponse<M extends ListResponseIteree> = {
  readonly data: M[];
  readonly count: number;
};

export type MarkupResponseType<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  A extends import("lib/model").Account | import("lib/model").SubAccount =
    | import("lib/model").Account
    | import("lib/model").SubAccount,
> =
  | ParentChildResponse<B, import("lib/model").Markup>
  | AncestryResponse<B, A, import("lib/model").Markup>;

export const markupResponseTypeIsAncestry = <
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  A extends import("lib/model").Account | import("lib/model").SubAccount =
    | import("lib/model").Account
    | import("lib/model").SubAccount,
>(
  response: MarkupResponseType<B, A>,
): response is AncestryResponse<B, A, import("lib/model").Markup> =>
  (response as AncestryResponse<B, A, import("lib/model").Markup>).parent !== undefined &&
  (response as AncestryResponse<B, A, import("lib/model").Markup>).budget !== undefined;

export type ReorderResponse = { data: number[] };

export type ParentResponse<PARENT extends import("lib/model").ApiModel> = {
  readonly parent: PARENT;
};

export type ParentChildResponse<
  PARENT extends import("lib/model").ApiModel,
  CHILD extends import("lib/model").ApiModel,
> = ParentResponse<PARENT> & {
  readonly data: CHILD;
};

export type AncestryResponse<
  GP extends import("lib/model").ApiModel,
  PARENT extends import("lib/model").ApiModel,
  CHILD extends import("lib/model").ApiModel,
> = ParentChildResponse<PARENT, CHILD> & {
  readonly budget: GP;
};

export type ChildListResponse<CHILD extends import("lib/model").ApiModel> = {
  readonly children: CHILD[];
};

export type ParentChildListResponse<
  PARENT extends import("lib/model").ApiModel,
  CHILD extends import("lib/model").ApiModel,
> = ParentResponse<PARENT> & ChildListResponse<CHILD>;

export type ParentsResponse<
  GP extends import("lib/model").ApiModel,
  PARENT extends import("lib/model").ApiModel,
> = {
  readonly budget: GP;
  readonly parent: PARENT;
};

export type AncestryListResponse<
  GP extends import("lib/model").ApiModel,
  PARENT extends import("lib/model").ApiModel,
  CHILD extends import("lib/model").ApiModel,
> = ParentChildListResponse<PARENT, CHILD> & {
  readonly budget: GP;
};
