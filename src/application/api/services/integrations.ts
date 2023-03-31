import { client } from "../client";

export const createPlaidLinkToken = client.createPostService<{ readonly link_token: string }>(
  "/integrations/plaid/link-token/",
);
