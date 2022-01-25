declare namespace Model {
  type BillingStatus = "active" | "expired" | "canceled" | null;

  type ProductId = "greenbudget_standard";
  type ProductPermissionId = "multiple_budgets";

  type StripeSubscriptionStatus =
    | "active"
    | "trialing"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired";

  interface Product {
    readonly id: ProductId;
    readonly price_id: string;
    readonly active: boolean;
    readonly description: string | null;
    readonly name: string;
    readonly stripe_id: string;
    readonly image: string | null;
  }

  type Subscription = {
    readonly id: string;
    readonly cancel_at_period_end: boolean;
    readonly canceled_at: string | null;
    readonly current_period_start: string | null;
    readonly current_period_end: string | null;
    readonly start_date: string;
    readonly cancel_at: string | null;
    readonly status: BillingStatus;
    readonly stripe_status: StripeSubscriptionStatus;
  };
}
