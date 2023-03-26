import { model } from "lib";

export type Payload = FormData | model.JsonObject;

export type AuthTokenValidationPayload = {
  readonly force_reload_from_stripe?: boolean;
};

export type PublicTokenValidationPayload = {
  readonly token: string;
  readonly instance: {
    readonly type: model.ApiModelType;
    readonly id: number;
  };
};

export type SocialPayload = {
  readonly token_id: string;
  readonly provider: string;
};

export type RegistrationPayload = {
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly password: string;
};

export type ResetPasswordPayload = {
  readonly password: string;
  readonly token: string;
};

export type ChangePasswordPayload = {
  readonly password: string;
  readonly new_password: string;
};

export type UserPayload = {
  readonly profile_image?: string | ArrayBuffer | null;
  readonly first_name: string;
  readonly last_name: string;
  readonly company?: string | null;
  readonly position?: string | null;
  readonly city?: string | null;
  readonly phone_number?: string | null;
  readonly timezone?: string;
};

export type PublicTokenPayload = {
  readonly expires_at?: string | null;
  // PublicID is only included in POST requests, not PATCH requests.
  readonly public_id?: string;
};

export type FringePayload = {
  readonly name?: string;
  readonly description?: string | null;
  readonly cutoff?: number | null;
  readonly rate?: number;
  readonly unit?: model.FringeUnit["id"];
  readonly color?: string | null;
  readonly previous?: number | null;
  // Only allowed to be provided on POST requests to create a Fringe.
  readonly subaccounts?: number[];
};

export type MarkupPayload = {
  readonly identifier?: string | null;
  readonly description?: string | null;
  readonly unit: model.MarkupUnit["id"];
  readonly rate?: number | null;
  readonly children?: number[];
  readonly groups?: number[];
};

export type ModifyMarkupPayload = {
  readonly children?: number[];
  readonly groups?: number[];
};

export type BudgetPayload = {
  readonly name: model.Budget["name"];
  readonly template?: number;
  readonly image?: string | ArrayBuffer | null;
  readonly archived?: boolean;
};

export type CollaboratorPayload = {
  readonly access_type: model.CollaboratorAccessType["id"];
  // The user is only allowed to be included when creating collaborators, not updating them. */
  readonly user: number;
};

export type TemplatePayload = {
  readonly image?: string | ArrayBuffer | null;
  readonly community?: boolean;
  readonly hidden?: boolean;
  readonly name: model.Template["name"];
};

export type GroupPayload = {
  readonly children_markups?: number[];
  readonly name: model.Group["name"];
  readonly color?: model.Group["color"];
  readonly children?: number[];
};

export type AccountPayload = {
  readonly group?: number | null;
  readonly previous?: number | null;
  readonly identifier?: model.Account["identifier"];
  readonly description?: model.Account["description"];
};

export type SubAccountPayload = {
  readonly description?: model.SubAccount["description"];
  readonly identifier?: model.SubAccount["identifier"];
  readonly contact?: model.SubAccount["contact"];
  readonly quantity?: model.SubAccount["quantity"];
  readonly rate?: model.SubAccount["rate"];
  readonly multiplier?: model.SubAccount["multiplier"];
  readonly fringes?: model.SubAccount["fringes"];
  readonly unit?: number | null;
  readonly group?: number | null;
  readonly attachments?: model.SubAccount["attachments"];
  readonly previous?: number | null;
};

export type ActualPayload = {
  readonly contact?: model.Actual["contact"];
  readonly name?: model.Actual["name"];
  readonly purchase_order?: model.Actual["purchase_order"];
  readonly date?: model.Actual["date"];
  readonly payment_id?: model.Actual["payment_id"];
  readonly value?: model.Actual["value"];
  readonly notes?: model.Actual["notes"];
  readonly actual_type?: number | null;
  readonly attachments?: number[];
  readonly owner: model.TypedApiModel<"subaccount"> | model.TypedApiModel<"markup"> | null;
  readonly previous?: number | null;
};

export type BulkImportActualsPayload = {
  readonly start_date: string;
  readonly end_date?: string | null;
  readonly source: model.ActualImportSource["id"];
  readonly public_token: string;
  readonly account_ids?: string[];
};

export type HeaderTemplatePayload = {
  readonly name?: model.HeaderTemplate["name"];
  readonly header?: model.HeaderTemplate["header"];
  readonly left_info?: model.HeaderTemplate["left_info"];
  readonly right_info?: model.HeaderTemplate["right_info"];
  readonly left_image?: string | ArrayBuffer | null;
  readonly right_image?: string | ArrayBuffer | null;
  readonly original?: number;
};

export type ContactPayload = {
  readonly company?: model.Contact["company"];
  readonly notes?: model.Contact["notes"];
  readonly position?: model.Contact["position"];
  readonly rate?: model.Contact["rate"];
  readonly city?: model.Contact["city"];
  readonly phone_number?: model.Contact["phone_number"];
  readonly email?: model.Contact["email"];
  readonly contact_type?: model.ContactType["id"] | null;
  readonly image?: ArrayBuffer | string | null;
  readonly previous?: number | null;
  readonly first_name: model.Contact["first_name"];
  readonly last_name: model.Contact["last_name"];
};

export type BulkCreatePayload<T extends model.JsonObject> = { data: Partial<T>[] };
export type ModelBulkUpdatePayload<T extends model.JsonObject> = Partial<T> & {
  readonly id: number;
};
export type BulkUpdatePayload<T extends model.JsonObject> = { data: ModelBulkUpdatePayload<T>[] };
export type BulkDeletePayload = { ids: number[] };

export type CheckoutSessionPayload = {
  readonly price_id: string;
};

export type SyncCheckoutSessionPayload = {
  readonly session_id: string;
};

export type ModelPayloadMap = {
  contact: ContactPayload;
  actual: ActualPayload;
  budget: BudgetPayload | TemplatePayload;
  fringe: FringePayload;
  markup: MarkupPayload;
  account: AccountPayload;
  subaccount: SubAccountPayload;
  group: GroupPayload;
  collaborator: CollaboratorPayload;
};

export type ModelPayload<M extends model.TypedApiModel> = M["type"] extends keyof ModelPayloadMap
  ? ModelPayloadMap[M["type"]]
  : never;
