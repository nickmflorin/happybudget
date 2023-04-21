import { ActualFileObject } from "filepond/types";

import { schemas } from "lib";

export type FilepondFile = ActualFileObject;
export type PayloadData = schemas.JsonObject;
export type Payload<P extends PayloadData = PayloadData> = FormData | P;

export const payloadIsFormData = <P extends PayloadData>(p: Payload<P>): p is FormData =>
  p instanceof FormData;

export type SingleFile = File | FilepondFile;
export type UploadableFileProp = SingleFile | FileList | SingleFile[];

export const isSingleFile = (f: UploadableFileProp): f is SingleFile =>
  typeof f === "object" &&
  !Array.isArray(f) &&
  !(f instanceof FileList) &&
  (f as SingleFile).name !== undefined;

export const isFiles = (f: UploadableFileProp): f is SingleFile[] => Array.isArray(f);

export type AuthTokenValidationPayload = {
  readonly force_reload_from_stripe?: boolean;
};

export type PublicTokenValidationPayload = {
  readonly token: string;
  readonly instance: {
    readonly type: import("lib/model").ApiModelType;
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
  readonly unit?: import("lib/model").FringeUnit["id"];
  readonly color?: string | null;
  readonly previous?: number | null;
  // Only allowed to be provided on POST requests to create a Fringe.
  readonly subaccounts?: number[];
};

export type MarkupPayload = {
  readonly identifier?: string | null;
  readonly description?: string | null;
  readonly unit: import("lib/model").MarkupUnit["id"];
  readonly rate?: number | null;
  readonly children?: number[];
  readonly groups?: number[];
};

export type ModifyMarkupPayload = {
  readonly children?: number[];
  readonly groups?: number[];
};

export type BudgetPayload = {
  readonly name: import("lib/model").Budget["name"];
  readonly template?: number;
  readonly image?: string | ArrayBuffer | null;
  readonly archived?: boolean;
};

export type CollaboratorPayload = {
  readonly access_type: import("lib/model").CollaboratorAccessType["id"];
  // The user is only allowed to be included when creating collaborators, not updating them. */
  readonly user: number;
};

export type TemplatePayload = {
  readonly image?: string | ArrayBuffer | null;
  readonly community?: boolean;
  readonly hidden?: boolean;
  readonly name: import("lib/model").Template["name"];
};

export type GroupPayload = {
  readonly children_markups?: number[];
  readonly name: import("lib/model").Group["name"];
  readonly color?: import("lib/model").Group["color"];
  readonly children?: number[];
};

export type AccountPayload = {
  readonly group?: number | null;
  readonly previous?: number | null;
  readonly identifier?: import("lib/model").Account["identifier"];
  readonly description?: import("lib/model").Account["description"];
};

export type SubAccountPayload = {
  readonly description?: import("lib/model").SubAccount["description"];
  readonly identifier?: import("lib/model").SubAccount["identifier"];
  readonly contact?: import("lib/model").SubAccount["contact"];
  readonly quantity?: import("lib/model").SubAccount["quantity"];
  readonly rate?: import("lib/model").SubAccount["rate"];
  readonly multiplier?: import("lib/model").SubAccount["multiplier"];
  readonly fringes?: import("lib/model").SubAccount["fringes"];
  readonly unit?: number | null;
  readonly group?: number | null;
  readonly attachments?: import("lib/model").SubAccount["attachments"];
  readonly previous?: number | null;
};

export type ActualPayload = {
  readonly contact?: import("lib/model").Actual["contact"];
  readonly name?: import("lib/model").Actual["name"];
  readonly purchase_order?: import("lib/model").Actual["purchase_order"];
  readonly date?: import("lib/model").Actual["date"];
  readonly payment_id?: import("lib/model").Actual["payment_id"];
  readonly value?: import("lib/model").Actual["value"];
  readonly notes?: import("lib/model").Actual["notes"];
  readonly actual_type?: number | null;
  readonly attachments?: number[];
  readonly owner:
    | import("lib/model").TypedApiModel<"subaccount">
    | import("lib/model").TypedApiModel<"markup">
    | null;
  readonly previous?: number | null;
};

export type BulkImportActualsPayload = {
  readonly start_date: string;
  readonly end_date?: string | null;
  readonly source: import("lib/model").ActualImportSource["id"];
  readonly public_token: string;
  readonly account_ids?: string[];
};

export type HeaderTemplatePayload = {
  readonly name?: import("lib/model").HeaderTemplate["name"];
  readonly header?: import("lib/model").HeaderTemplate["header"];
  readonly left_info?: import("lib/model").HeaderTemplate["left_info"];
  readonly right_info?: import("lib/model").HeaderTemplate["right_info"];
  readonly left_image?: string | ArrayBuffer | null;
  readonly right_image?: string | ArrayBuffer | null;
  readonly original?: number;
};

export type ContactPayload = {
  readonly company?: import("lib/model").Contact["company"];
  readonly notes?: import("lib/model").Contact["notes"];
  readonly position?: import("lib/model").Contact["position"];
  readonly rate?: import("lib/model").Contact["rate"];
  readonly city?: import("lib/model").Contact["city"];
  readonly phone_number?: import("lib/model").Contact["phone_number"];
  readonly email?: import("lib/model").Contact["email"];
  readonly contact_type?: import("lib/model").ContactType["id"] | null;
  readonly image?: ArrayBuffer | string | null;
  readonly previous?: number | null;
  readonly first_name?: import("lib/model").Contact["first_name"];
  readonly last_name?: import("lib/model").Contact["last_name"];
};

export type BulkCreatePayload<T extends PayloadData> = { data: Partial<T>[] };
export type ModelBulkUpdatePayload<T extends PayloadData> = Partial<T> & {
  readonly id: number;
};
export type BulkUpdatePayload<T extends PayloadData> = { data: ModelBulkUpdatePayload<T>[] };
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

export type ModelPayload<M extends import("lib/model").TypedApiModel> =
  M["type"] extends keyof ModelPayloadMap ? ModelPayloadMap[M["type"]] : never;
