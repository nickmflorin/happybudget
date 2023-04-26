import { billing, user } from "lib/model";

import { client } from "../client";
import * as types from "../types";

export const getProducts = client.createListService<billing.Product>("/billing/products");

export const getSubscription = client.createGetService<{ subscription: billing.Subscription }>(
  "/billing/subscription",
);

export const createCheckoutSession = client.createPostService<
  { redirect_url: string },
  types.CheckoutSessionPayload
>("/billing/checkout-session/");

export const syncCheckoutSession = client.createPostService<
  user.User,
  types.SyncCheckoutSessionPayload
>("/billing/sync-checkout-session/");

export const createPortalSession = client.createPostService<{ redirect_url: string }>(
  "/billing/sync-checkout-session/",
);
