import * as tabling from "../../tabling";
import * as budgeting from "../budgeting";
import * as contact from "../contact";

export type BudgetRowData = budgeting.LineMetrics & {
  readonly identifier: string | null;
  readonly description: string | null;
};

export type AccountRowData = BudgetRowData;
export type AccountRow = tabling.Row<AccountRowData>;

export type SubAccountRowData = BudgetRowData &
  Pick<
    budgeting.SubAccount,
    | "quantity"
    | "unit"
    | "multiplier"
    | "rate"
    | "fringes"
    | "fringe_contribution"
    | "attachments"
    | "contact"
  >;
export type SubAccountRow = tabling.Row<SubAccountRowData>;

export type FringeRowData = Pick<
  budgeting.Fringe,
  "color" | "name" | "description" | "cutoff" | "rate" | "unit"
>;
export type FringeRow = tabling.Row<FringeRowData>;

export type ActualRowData = Pick<
  budgeting.Actual,
  | "name"
  | "notes"
  | "purchase_order"
  | "date"
  | "actual_type"
  | "payment_id"
  | "value"
  | "contact"
  | "owner"
  | "attachments"
>;
export type ActualRow = tabling.Row<ActualRowData>;

export type ContactRowData = Pick<
  contact.Contact,
  | "contact_type"
  | "company"
  | "position"
  | "rate"
  | "phone_number"
  | "email"
  | "first_name"
  | "last_name"
  | "image"
  | "attachments"
>;

export type ContactRow = tabling.Row<ContactRowData>;
