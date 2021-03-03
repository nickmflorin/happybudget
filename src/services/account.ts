import { client } from "api";
import { URL } from "./util";

export const getAccounts = async (
  budgetId: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IAccount>> => {
  const url = URL.v1("budgets", budgetId, "accounts");
  return client.list<IAccount>(url, query, options);
};

export const getAccount = async (id: number, options: Http.IRequestOptions = {}): Promise<IAccount> => {
  const url = URL.v1("accounts", id);
  return client.retrieve<IAccount>(url, options);
};
