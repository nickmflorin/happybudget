import { client } from "api";

import * as services from "./services";

export const getProducts = services.listService<Model.Product>(["billing", "products"]);

export const getSubscription = async (
  options?: Http.RequestOptions,
): Promise<{ subscription: Model.Subscription | null }> => {
  const url = services.URL.v1("billing", "subscription");
  return client.get<{ subscription: Model.Subscription | null }>(url, {}, options);
};

export const createCheckoutSession = services.postService<
  Http.CheckoutSessionPayload,
  { redirect_url: string }
>(["billing", "checkout-session"]);

export const syncCheckoutSession = services.patchService<
  Http.SyncCheckoutSessionPayload,
  Model.User
>(["billing", "sync-checkout-session"]);

export const createPortalSession = services.postService<
  Record<string, never>,
  { redirect_url: string }
>(["billing", "portal-session"]);
