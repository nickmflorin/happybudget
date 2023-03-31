import { model } from "lib";

import * as types from "../types";

import * as account from "./account";
import * as budget from "./budget";
import * as subaccount from "./subaccount";

export const getTableChildren = <
  M extends model.Account | model.SubAccount,
  P extends model.ParentType<M>,
  Q extends types.ApiModelListQuery<M> = types.ApiModelListQuery<M>,
>(
  parentId: number,
  parentType: P,
  options?: types.ClientRequestOptions<{ query: Q }>,
): Promise<types.ClientResponse<types.ModelListResponse<M>, { query: Q }>> => {
  const serviceMap = {
    budget: async (id: number, o?: types.ClientRequestOptions<{ query: Q }>) =>
      budget.getBudgetChildren(
        { id },
        o as types.ClientRequestOptions<{ query: types.ApiModelListQuery<model.Account> }>,
      ),
    account: async (id: number, o?: types.ClientRequestOptions<{ query: Q }>) =>
      account.getAccountChildren(
        { id },
        o as types.ClientRequestOptions<{ query: types.ApiModelListQuery<model.SubAccount> }>,
      ),
    subaccount: async (id: number, o?: types.ClientRequestOptions<{ query: Q }>) =>
      subaccount.getSubAccountChildren(
        { id },
        o as types.ClientRequestOptions<{ query: types.ApiModelListQuery<model.SubAccount> }>,
      ),
  };
  return serviceMap[parentType](parentId, options) as Promise<
    types.ClientResponse<types.ModelListResponse<M>, { query: Q }>
  >;
};

export const getTableSimpleChildren = <
  M extends model.SimpleAccount | model.SimpleSubAccount,
  P extends model.ParentType<M>,
  Q extends types.ApiModelListQuery<M> = types.ApiModelListQuery<M>,
>(
  parentId: number,
  parentType: P,
  options?: types.ClientRequestOptions<{ query: Q }>,
): Promise<types.ClientResponse<types.ModelListResponse<M>, { query: Q }>> => {
  const serviceMap = {
    budget: async (id: number, o?: types.ClientRequestOptions<{ query: Q }>) =>
      budget.getBudgetSimpleChildren(
        { id },
        o as types.ClientRequestOptions<{ query: types.ApiModelListQuery<model.SimpleAccount> }>,
      ),
    account: async (id: number, o?: types.ClientRequestOptions<{ query: Q }>) =>
      account.getAccountSimpleChildren(
        { id },
        o as types.ClientRequestOptions<{ query: types.ApiModelListQuery<model.SimpleSubAccount> }>,
      ),
    subaccount: async (id: number, o?: types.ClientRequestOptions<{ query: Q }>) =>
      subaccount.getSubAccountSimpleChildren(
        { id },
        o as types.ClientRequestOptions<{ query: types.ApiModelListQuery<model.SimpleSubAccount> }>,
      ),
  };
  return serviceMap[parentType](parentId, options) as Promise<
    types.ClientResponse<types.ModelListResponse<M>, { query: Q }>
  >;
};

export const createTableMarkup = <
  B extends model.Budget | model.Template,
  A extends model.Account | model.SubAccount,
  P extends model.ParentType<A>,
  R extends types.MarkupResponseType<B, A> = types.MarkupResponseType<B, A>,
>(
  parentId: number,
  parentType: P,
  body: types.MarkupPayload,
  options?: Omit<types.ClientRequestOptions<{ body: types.MarkupPayload }>, "body">,
): Promise<types.ClientResponse<R, { body: types.MarkupPayload }>> => {
  const serviceMap = {
    budget: async (id: number, o?: types.ClientRequestOptions<{ body: types.MarkupPayload }>) =>
      budget.createBudgetMarkup({ id }, { ...o, body } as types.ClientRequestOptions<{
        body: types.MarkupPayload;
      }>),
    account: async (id: number, o?: types.ClientRequestOptions<{ body: types.MarkupPayload }>) =>
      account.createAccountMarkup({ id }, { ...o, body } as types.ClientRequestOptions<{
        body: types.MarkupPayload;
      }>),
    subaccount: async (id: number, o?: types.ClientRequestOptions<{ body: types.MarkupPayload }>) =>
      subaccount.createSubAccountMarkup({ id }, { ...o, body } as types.ClientRequestOptions<{
        body: types.MarkupPayload;
      }>),
  };
  return serviceMap[parentType](parentId, options) as Promise<
    types.ClientResponse<R, { body: types.MarkupPayload }>
  >;
};

export const getTableGroups = <
  P extends model.ParentType,
  Q extends types.ApiModelListQuery<model.Group> = types.ApiModelListQuery<model.Group>,
>(
  parentId: number,
  parentType: P,
  options?: types.ClientRequestOptions<{ query: Q }>,
): Promise<types.ClientResponse<types.ModelListResponse<model.Group>, { query: Q }>> => {
  const serviceMap = {
    budget: async (id: number, o?: types.ClientRequestOptions<{ query: Q }>) =>
      budget.getBudgetGroups(
        { id },
        o as types.ClientRequestOptions<{ query: types.ApiModelListQuery<model.Group> }>,
      ),
    account: async (id: number, o?: types.ClientRequestOptions<{ query: Q }>) =>
      account.getAccountGroups(
        { id },
        o as types.ClientRequestOptions<{ query: types.ApiModelListQuery<model.Group> }>,
      ),
    subaccount: async (id: number, o?: types.ClientRequestOptions<{ query: Q }>) =>
      subaccount.getSubAccountGroups(
        { id },
        o as types.ClientRequestOptions<{ query: types.ApiModelListQuery<model.Group> }>,
      ),
  };
  return serviceMap[parentType](parentId, options) as Promise<
    types.ClientResponse<types.ModelListResponse<model.Group>, { query: Q }>
  >;
};

export const createTableGroup = (
  parentId: number,
  parentType: model.ParentType,
  body: types.GroupPayload,
  options?: Omit<types.ClientRequestOptions<{ body: types.GroupPayload }>, "body">,
): Promise<
  types.ClientResponse<types.ApiSuccessResponse<model.Group>, { body: types.GroupPayload }>
> => {
  const serviceMap = {
    budget: async (id: number, o?: types.ClientRequestOptions<{ body: types.GroupPayload }>) =>
      budget.createBudgetGroup({ id }, { ...o, body } as types.ClientRequestOptions<{
        body: types.GroupPayload;
      }>),
    account: async (id: number, o?: types.ClientRequestOptions<{ body: types.GroupPayload }>) =>
      account.createAccountGroup({ id }, { ...o, body } as types.ClientRequestOptions<{
        body: types.GroupPayload;
      }>),
    subaccount: async (id: number, o?: types.ClientRequestOptions<{ body: types.GroupPayload }>) =>
      subaccount.createSubAccountGroup({ id }, { ...o, body } as types.ClientRequestOptions<{
        body: types.GroupPayload;
      }>),
  };
  return serviceMap[parentType](parentId, options) as Promise<
    types.ClientResponse<types.ApiSuccessResponse<model.Group>, { body: types.GroupPayload }>
  >;
};
