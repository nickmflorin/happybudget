import { client } from "api";
import { URL } from "./util";

export const getAccountsHistory = async (
  budgetId: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IFieldAlterationEvent>> => {
  const url = URL.v1("budgets", budgetId, "accounts", "history");
  return client.list<IFieldAlterationEvent>(url, query, options);
};

export const getAccountHistory = async (
  accountId: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IFieldAlterationEvent>> => {
  const url = URL.v1("accounts", accountId, "history");
  return client.list<IFieldAlterationEvent>(url, query, options);
};

export const getSubAccountsHistory = async (
  accountId: number,
  budgetId: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IFieldAlterationEvent>> => {
  const url = URL.v1("budgets", budgetId, "accounts", accountId, "subaccounts", "history");
  return client.list<IFieldAlterationEvent>(url, query, options);
};

export const getSubAccountHistory = async (
  subaccountId: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IFieldAlterationEvent>> => {
  const url = URL.v1("subaccounts", subaccountId, "history");
  return client.list<IFieldAlterationEvent>(url, query, options);
};

export const getActualsHistory = async (
  budgetId: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IFieldAlterationEvent>> => {
  const url = URL.v1("budgets", budgetId, "actuals", "history");
  return client.list<IFieldAlterationEvent>(url, query, options);
};

export const getActualHistory = async (
  actualId: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IFieldAlterationEvent>> => {
  const url = URL.v1("actuals", actualId, "history");
  return client.list<IFieldAlterationEvent>(url, query, options);
};
