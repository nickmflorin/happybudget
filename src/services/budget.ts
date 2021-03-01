import { client } from "api";
import { URL } from "./util";

export const getBudgets = async (
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IBudget>> => {
  const url = URL.v1("budgets");
  return client.list<IBudget>(url, query, options);
};

export const getBudget = async (id: number, options: Http.IRequestOptions = {}): Promise<IBudget> => {
  const url = URL.v1("budgets", id);
  return client.retrieve<IBudget>(url, options);
};
