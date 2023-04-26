import { budgeting } from "lib/model";

import * as types from "../types";

import * as account from "./account";
import * as budget from "./budget";
import * as subaccount from "./subaccount";

export const getTableChildren = <
  M extends budgeting.Account | budgeting.SubAccount,
  P extends budgeting.ParentType<M>,
  Q extends types.ApiModelListQuery<M> = types.ApiModelListQuery<M>,
>(
  parentId: number,
  parentType: P,
  options?: types.ExposedClientRequestOptions<{ query: Q }>,
): Promise<types.ClientResponse<types.ApiListResponse<M>, { query: Q }>> => {
  const serviceMap = {
    budget: async (id: number, o?: types.ExposedClientRequestOptions<{ query: Q }>) =>
      budget.getBudgetChildren(
        { id },
        o as types.ExposedClientRequestOptions<{
          query: types.ApiModelListQuery<budgeting.Account>;
        }>,
      ),
    account: async (id: number, o?: types.ExposedClientRequestOptions<{ query: Q }>) =>
      account.getAccountChildren(
        { id },
        o as types.ExposedClientRequestOptions<{
          query: types.ApiModelListQuery<budgeting.SubAccount>;
        }>,
      ),
    subaccount: async (id: number, o?: types.ExposedClientRequestOptions<{ query: Q }>) =>
      subaccount.getSubAccountChildren(
        { id },
        o as types.ExposedClientRequestOptions<{
          query: types.ApiModelListQuery<budgeting.SubAccount>;
        }>,
      ),
  };
  return serviceMap[parentType](parentId, options) as Promise<
    types.ClientResponse<types.ApiListResponse<M>, { query: Q }>
  >;
};

export const getTableSimpleChildren = <
  M extends budgeting.SimpleAccount | budgeting.SimpleSubAccount,
  P extends budgeting.ParentType<M>,
  Q extends types.ApiModelListQuery<M> = types.ApiModelListQuery<M>,
>(
  parentId: number,
  parentType: P,
  options?: types.ExposedClientRequestOptions<{ query: Q }>,
): Promise<types.ClientResponse<types.ApiListResponse<M>, { query: Q }>> => {
  const serviceMap = {
    budget: async (id: number, o?: types.ExposedClientRequestOptions<{ query: Q }>) =>
      budget.getBudgetSimpleChildren(
        { id },
        o as types.ExposedClientRequestOptions<{
          query: types.ApiModelListQuery<budgeting.SimpleAccount>;
        }>,
      ),
    account: async (id: number, o?: types.ExposedClientRequestOptions<{ query: Q }>) =>
      account.getAccountSimpleChildren(
        { id },
        o as types.ExposedClientRequestOptions<{
          query: types.ApiModelListQuery<budgeting.SimpleSubAccount>;
        }>,
      ),
    subaccount: async (id: number, o?: types.ExposedClientRequestOptions<{ query: Q }>) =>
      subaccount.getSubAccountSimpleChildren(
        { id },
        o as types.ExposedClientRequestOptions<{
          query: types.ApiModelListQuery<budgeting.SimpleSubAccount>;
        }>,
      ),
  };
  return serviceMap[parentType](parentId, options) as Promise<
    types.ClientResponse<types.ApiListResponse<M>, { query: Q }>
  >;
};

export const createTableMarkup = <
  B extends budgeting.Budget | budgeting.Template,
  A extends budgeting.Account | budgeting.SubAccount,
  P extends budgeting.ParentType<A>,
  R extends types.MarkupResponseType<B, A> = types.MarkupResponseType<B, A>,
>(
  parentId: number,
  parentType: P,
  body: types.MarkupPayload,
  options?: Omit<types.ExposedClientRequestOptions<{ body: types.MarkupPayload }>, "body">,
): Promise<types.ClientResponse<R, { body: types.MarkupPayload }>> => {
  const serviceMap = {
    budget: async (
      id: number,
      o?: types.ExposedClientRequestOptions<{ body: types.MarkupPayload }>,
    ) =>
      budget.createBudgetMarkup({ id }, { ...o, body } as types.ExposedClientRequestOptions<{
        body: types.MarkupPayload;
      }>),
    account: async (
      id: number,
      o?: types.ExposedClientRequestOptions<{ body: types.MarkupPayload }>,
    ) =>
      account.createAccountMarkup({ id }, { ...o, body } as types.ExposedClientRequestOptions<{
        body: types.MarkupPayload;
      }>),
    subaccount: async (
      id: number,
      o?: types.ExposedClientRequestOptions<{ body: types.MarkupPayload }>,
    ) =>
      subaccount.createSubAccountMarkup({ id }, {
        ...o,
        body,
      } as types.ExposedClientRequestOptions<{
        body: types.MarkupPayload;
      }>),
  };
  return serviceMap[parentType](parentId, options) as Promise<
    types.ClientResponse<R, { body: types.MarkupPayload }>
  >;
};

export const getTableGroups = <
  P extends budgeting.ParentType,
  Q extends types.ApiModelListQuery<budgeting.Group> = types.ApiModelListQuery<budgeting.Group>,
>(
  parentId: number,
  parentType: P,
  options?: types.ExposedClientRequestOptions<{ query: Q }>,
): Promise<types.ClientResponse<types.ApiListResponse<budgeting.Group>, { query: Q }>> => {
  const serviceMap = {
    budget: async (id: number, o?: types.ExposedClientRequestOptions<{ query: Q }>) =>
      budget.getBudgetGroups(
        { id },
        o as types.ExposedClientRequestOptions<{ query: types.ApiModelListQuery<budgeting.Group> }>,
      ),
    account: async (id: number, o?: types.ExposedClientRequestOptions<{ query: Q }>) =>
      account.getAccountGroups(
        { id },
        o as types.ExposedClientRequestOptions<{ query: types.ApiModelListQuery<budgeting.Group> }>,
      ),
    subaccount: async (id: number, o?: types.ExposedClientRequestOptions<{ query: Q }>) =>
      subaccount.getSubAccountGroups(
        { id },
        o as types.ExposedClientRequestOptions<{ query: types.ApiModelListQuery<budgeting.Group> }>,
      ),
  };
  return serviceMap[parentType](parentId, options) as Promise<
    types.ClientResponse<types.ApiListResponse<budgeting.Group>, { query: Q }>
  >;
};

export const createTableGroup = (
  parentId: number,
  parentType: budgeting.ParentType,
  body: types.GroupPayload,
  options?: Omit<types.ExposedClientRequestOptions<{ body: types.GroupPayload }>, "body">,
): Promise<
  types.ClientResponse<types.ApiSuccessResponse<budgeting.Group>, { body: types.GroupPayload }>
> => {
  const serviceMap = {
    budget: async (
      id: number,
      o?: types.ExposedClientRequestOptions<{ body: types.GroupPayload }>,
    ) =>
      budget.createBudgetGroup({ id }, { ...o, body } as types.ExposedClientRequestOptions<{
        body: types.GroupPayload;
      }>),
    account: async (
      id: number,
      o?: types.ExposedClientRequestOptions<{ body: types.GroupPayload }>,
    ) =>
      account.createAccountGroup({ id }, { ...o, body } as types.ExposedClientRequestOptions<{
        body: types.GroupPayload;
      }>),
    subaccount: async (
      id: number,
      o?: types.ExposedClientRequestOptions<{ body: types.GroupPayload }>,
    ) =>
      subaccount.createSubAccountGroup({ id }, { ...o, body } as types.ExposedClientRequestOptions<{
        body: types.GroupPayload;
      }>),
  };
  return serviceMap[parentType](parentId, options) as Promise<
    types.ClientResponse<types.ApiSuccessResponse<budgeting.Group>, { body: types.GroupPayload }>
  >;
};
