import * as fs from "../../fs";
import * as billing from "../billing";
import * as contact from "../contact";
import * as types from "../types";

export type SimpleUser = types.ApiModel & {
  readonly first_name: string;
  readonly last_name: string;
  readonly full_name: string;
  readonly email: string;
  readonly profile_image: fs.SavedImage | null;
};

export type UserMetrics = {
  readonly num_budgets: number;
  readonly num_collaborating_budgets: number;
  readonly num_templates: number;
  readonly num_archived_budgets: number;
};

export type User = SimpleUser & {
  readonly last_login: null | string;
  readonly date_joined: string;
  readonly timezone: string;
  readonly is_first_time: boolean;
  readonly is_active: boolean;
  readonly is_staff: boolean;
  readonly is_superuser: boolean;
  readonly company: string | null;
  readonly position: string | null;
  readonly address: string | null;
  readonly phone_number: number | null;
  readonly product_id: billing.ProductId | null;
  readonly billing_status: billing.BillingStatus | null;
  readonly metrics: UserMetrics;
};

export type UserWithImage =
  | (User & { profile_image: fs.SavedImage })
  | (SimpleUser & { profile_image: fs.SavedImage })
  | (contact.Contact & { image: fs.SavedImage });

export const isUserWithImage = (user: User | SimpleUser | contact.Contact): user is UserWithImage =>
  contact.isContact(user) ? user.image !== null : user.profile_image !== null;
