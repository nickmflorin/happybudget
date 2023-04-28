import { enumeratedLiterals, EnumeratedLiteralType } from "../../util/literals";
import { EnumeratedLiteralType } from "../../util/types/literals";
import * as types from "../types";

export const BilingStatuses = enumeratedLiterals(["active", "expired", "cancelled"] as const);
export type BillingStatus = EnumeratedLiteralType<typeof BilingStatuses> | null;

export const ProductIds = enumeratedLiterals(["standard"] as const);
export type ProductId = EnumeratedLiteralType<typeof ProductIds>;

export const ProductPermissionIds = enumeratedLiterals(["multiple_budgets"] as const);
export type ProductPermissionId = EnumeratedLiteralType<typeof ProductPermissionIds>;

export const StripeSubscriptionStatuses = enumeratedLiterals([
  "active",
  "trialing",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired",
] as const);
export type StripeSubscriptionStatus = EnumeratedLiteralType<typeof StripeSubscriptionStatuses>;

export type Product = types.Model<ProductId> & {
  readonly price_id: string;
  readonly active: boolean;
  readonly description: string | null;
  readonly name: string;
  readonly stripe_id: string;
  readonly image: string | null;
};

export type Subscription = types.Model<string> & {
  readonly cancel_at_period_end: boolean;
  readonly canceled_at: string | null;
  readonly current_period_start: string | null;
  readonly current_period_end: string | null;
  readonly start_date: string;
  readonly cancel_at: string | null;
  readonly status: BillingStatus;
  readonly stripe_status: StripeSubscriptionStatus;
};
