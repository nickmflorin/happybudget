import { client } from "api";
import * as services from "./services";

export const createPlaidLinkToken = async (
  options: Http.RequestOptions = {}
): Promise<{ readonly link_token: string }> => {
  const url = services.URL.v1("integrations", "plaid", "link-token");
  return client.post<{ readonly link_token: string }>(url, options);
};
