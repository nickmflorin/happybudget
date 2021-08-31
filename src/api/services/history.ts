import { client } from "api";
import { URL } from "./util";

export const getAccountsHistory = async (
  budgetId: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.HistoryEvent>> => {
  const url = URL.v1("budgets", budgetId, "accounts", "history");
  return client.list<Model.HistoryEvent>(url, query, options);
};

export const getAccountHistory = async (
  accountId: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.HistoryEvent>> => {
  const url = URL.v1("accounts", accountId, "history");
  return client.list<Model.HistoryEvent>(url, query, options);
};

export const getAccountSubAccountsHistory = async (
  accountId: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.HistoryEvent>> => {
  const url = URL.v1("accounts", accountId, "subaccounts", "history");
  return client.list<Model.HistoryEvent>(url, query, options);
};

export const getSubAccountSubAccountsHistory = async (
  subaccountId: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.HistoryEvent>> => {
  const url = URL.v1("subaccounts", subaccountId, "subaccounts", "history");
  return client.list<Model.HistoryEvent>(url, query, options);
};

export const getSubAccountHistory = async (
  subaccountId: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.HistoryEvent>> => {
  const url = URL.v1("subaccounts", subaccountId, "history");
  return client.list<Model.HistoryEvent>(url, query, options);
};

export const getActualsHistory = async (
  budgetId: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.HistoryEvent>> => {
  const url = URL.v1("budgets", budgetId, "actuals", "history");
  return client.list<Model.HistoryEvent>(url, query, options);
};

export const getActualHistory = async (
  actualId: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.HistoryEvent>> => {
  const url = URL.v1("actuals", actualId, "history");
  return client.list<Model.HistoryEvent>(url, query, options);
};
