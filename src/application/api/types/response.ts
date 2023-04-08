import { model, schemas } from "lib";

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
  B extends model.Budget | model.Template = model.Budget | model.Template,
  A extends model.Account | model.SubAccount = model.Account | model.SubAccount,
> = ParentChildResponse<B, model.Markup> | AncestryResponse<B, A, model.Markup>;

export const markupResponseTypeIsAncestry = <
  B extends model.Budget | model.Template = model.Budget | model.Template,
  A extends model.Account | model.SubAccount = model.Account | model.SubAccount,
>(
  response: MarkupResponseType<B, A>,
): response is AncestryResponse<B, A, model.Markup> =>
  (response as AncestryResponse<B, A, model.Markup>).parent !== undefined &&
  (response as AncestryResponse<B, A, model.Markup>).budget !== undefined;

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
