import { model } from "lib";

import { client } from "../client";
import * as types from "../types";

export const getProducts = client.createListService<model.Product>("/billing/products");

export const getSubscription = client.createGetService<{ subscription: model.Subscription }>(
  "/billing/subscription",
);

export const createCheckoutSession = client.createPostService<
  { redirect_url: string },
  types.CheckoutSessionPayload
>("/billing/checkout-session/");

export const syncCheckoutSession = client.createPostService<
  model.User,
  types.SyncCheckoutSessionPayload
>("/billing/sync-checkout-session/");

export const createPortalSession = client.createPostService<{ redirect_url: string }>(
  "/billing/sync-checkout-session/",
);
