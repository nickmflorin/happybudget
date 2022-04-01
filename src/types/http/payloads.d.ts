declare namespace Http {
  type PayloadObj = Record<string, unknown>;
  type Payload = FormData | PayloadObj;

  type AuthTokenValidationPayload = {
    readonly force_reload_from_stripe?: boolean;
  };

  type PublicTokenValidationPayload = {
    readonly token: string;
    readonly instance: {
      readonly type: Model.HttpModelType;
      readonly id: number;
    };
  };

  type SocialPayload = {
    readonly token_id: string;
    readonly provider: string;
  };

  type RegistrationPayload = {
    readonly first_name: string;
    readonly last_name: string;
    readonly email: string;
    readonly password: string;
  };

  type ResetPasswordPayload = {
    readonly password: string;
    readonly token: string;
  };

  type ChangePasswordPayload = {
    readonly password: string;
    readonly new_password: string;
  };

  type UserPayload = {
    readonly profile_image?: string | ArrayBuffer | null;
    readonly first_name: string;
    readonly last_name: string;
    readonly company?: string | null;
    readonly position?: string | null;
    readonly city?: string | null;
    readonly phone_number?: string | null;
    readonly timezone?: string;
  };

  type PublicTokenPayload = {
    readonly expires_at?: string | null;
    // PublicID is only included in POST requests, not PATCH requests.
    readonly public_id?: string;
  };

  type FringePayload = {
    readonly name: string;
    readonly description?: string | null;
    readonly cutoff?: number | null;
    readonly rate: number;
    readonly unit?: Model.FringeUnitId;
    readonly color?: string | null;
    readonly previous?: number | null;
  };

  type MarkupPayload = {
    readonly identifier?: string | null;
    readonly description?: string | null;
    readonly unit: Model.MarkupUnitId;
    readonly rate?: number | null;
    readonly children?: number[];
    readonly groups?: number[];
  };

  type ModifyMarkupPayload = {
    readonly children?: number[];
    readonly groups?: number[];
  };

  type BudgetPayload = {
    readonly name: Model.Budget["name"];
    readonly template?: number;
    readonly image?: string | ArrayBuffer | null;
  };

  type CollaboratorPayload = {
    readonly access_type: Model.CollaboratorAccessTypeId;
    /* The user is only allowed to be included when creating collaborators,
       not updating them. */
    readonly user: number;
  };

  type TemplatePayload = {
    readonly image?: string | ArrayBuffer | null;
    readonly community?: boolean;
    readonly hidden?: boolean;
    readonly name: Model.Template["name"];
  };

  type GroupPayload = {
    readonly children_markups?: number[];
    readonly name: Model.Group["name"];
    readonly color?: Model.Group["color"];
    readonly children?: number[];
  };

  type AccountPayload = {
    readonly group?: number | null;
    readonly previous?: number | null;
    readonly identifier?: Model.Account["identifier"];
    readonly description?: Model.Account["description"];
  };

  type SubAccountPayload = {
    readonly description?: Model.SubAccount["description"];
    readonly identifier?: Model.SubAccount["identifier"];
    readonly contact?: Model.SubAccount["contact"];
    readonly quantity?: Model.SubAccount["quantity"];
    readonly rate?: Model.SubAccount["rate"];
    readonly multiplier?: Model.SubAccount["multiplier"];
    readonly fringes?: Model.SubAccount["fringes"];
    readonly unit?: number | null;
    readonly group?: number | null;
    readonly attachments?: Model.SubAccount["attachments"];
    readonly previous?: number | null;
  };

  type ActualPayload = {
    readonly contact?: Model.Actual["contact"];
    readonly name?: Model.Actual["name"];
    readonly purchase_order?: Model.Actual["purchase_order"];
    readonly date?: Model.Actual["date"];
    readonly payment_id?: Model.Actual["payment_id"];
    readonly value?: Model.Actual["value"];
    readonly notes?: Model.Actual["notes"];
    readonly actual_type?: number | null;
    readonly attachments?: number[];
    readonly owner: Model.GenericHttpModel<"subaccount"> | Model.GenericHttpModel<"markup"> | null;
    readonly previous?: number | null;
  };

  type BulkImportActualsPayload = {
    readonly start_date: string;
    readonly end_date?: string | null;
    readonly source: Model.ActualImportSourceId;
    readonly public_token: string;
    readonly account_ids?: string[];
  };

  type HeaderTemplatePayload = {
    readonly name?: Model.HeaderTemplate["name"];
    readonly header?: Model.HeaderTemplate["header"];
    readonly left_info?: Model.HeaderTemplate["left_info"];
    readonly right_info?: Model.HeaderTemplate["right_info"];
    readonly left_image?: string | ArrayBuffer | null;
    readonly right_image?: string | ArrayBuffer | null;
    readonly original?: number;
  };

  type ContactPayload = {
    readonly company?: Model.Contact["company"];
    readonly notes?: Model.Contact["notes"];
    readonly position?: Model.Contact["position"];
    readonly rate?: Model.Contact["rate"];
    readonly city?: Model.Contact["city"];
    readonly phone_number?: Model.Contact["phone_number"];
    readonly email?: Model.Contact["email"];
    readonly contact_type?: Model.ContactTypeId | null;
    readonly image?: ArrayBuffer | string | null;
    readonly previous?: number | null;
    readonly first_name: Model.Contact["first_name"];
    readonly last_name: Model.Contact["last_name"];
  };

  type BulkCreatePayload<T extends PayloadObj> = { data: Partial<T>[] };
  type ModelBulkUpdatePayload<T extends PayloadObj> = Partial<T> & { readonly id: number };
  type BulkUpdatePayload<T extends PayloadObj> = { data: ModelBulkUpdatePayload<T>[] };
  type BulkDeletePayload = { ids: number[] };

  type CheckoutSessionPayload = {
    readonly price_id: string;
  };

  type SyncCheckoutSessionPayload = {
    readonly session_id: string;
  };

  type ModelPayloadMap = {
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

  type ModelPayload<M extends Model.GenericHttpModel> = M["type"] extends keyof ModelPayloadMap
    ? ModelPayloadMap[M["type"]]
    : never;
}
