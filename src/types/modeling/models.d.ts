/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Model {
  interface StringObj {
    [key: string]: any;
  }

  /* eslint-disable no-shadow */
  interface Model {
    readonly id: ID;
  }

  interface TimestampTrackedModel extends Model.Model {
    readonly created_at: string;
    readonly updated_at: string;
  }

  interface UserTrackedModel extends Model.Model {
    readonly created_by: number;
    readonly updated_by: number;
  }

  interface TrackedModel extends Model.UserTrackedModel, Model.TimestampTrackedModel {}

  interface Choice<I extends number, N extends string> {
    id: I;
    name: N;
  }

  type ProductionTypeName = "Film" | "Episodic" | "Music Video" | "Commercial" | "Documentary" | "Custom";
  type ProductionTypeId = 0 | 1 | 2 | 3 | 4 | 5;
  type ProductionType = Model.Choice<ProductionTypeId, ProductionTypeName>;

  type PaymentMethodName = "Check" | "Card" | "Wire";
  type PaymentMethodId = 0 | 1 | 2;
  type PaymentMethod = Model.Choice<PaymentMethodId, PaymentMethodName>;

  type FringeUnitId = 0 | 1;
  type FringeUnitName = "Percent" | "Flat";
  type FringeUnit = Model.Choice<FringeUnitId, FringeUnitName>;

  type ContactTypeName = "Contractor" | "Employee" | "Vendor";
  type ContactTypeId = 0 | 1 | 2;
  type ContactType = Model.Choice<ContactTypeId, ContactTypeName>;

  type LineType = "account" | "subaccount";
  type SimpleLineItem = Model.SimpleAccount | Model.SimpleSubAccount;
  type LineItem = Model.Account | Model.SubAccount;
  type PdfLineItem = Model.PdfAccount | Model.PdfSubAccount;

  type BudgetType = "budget" | "template";
  type EntityType = BudgetType | LineType;
  type Entity = Model.LineItem | Model.Budget | Model.Template;
  type SimpleEntity = Model.SimpleLineItem | Model.SimpleBudget | Model.SimpleTemplate;
  type PdfEntity = Model.PdfLineItem | Model.PdfBudget;

  type TemplateForm = Model.Template | Model.SimpleTemplate;
  type BudgetForm = Model.Budget | Model.SimpleBudget;
  type AccountForm = Model.Account | Model.SimpleAccount | Model.PdfAccount;
  type SubAccountForm = Model.SubAccount | Model.SimpleSubAccount | Model.PdfSubAccount;

  type ModelWithColor = Model.Model & { color: string | null };
  type ModelWithName = Model.Model & { name: string | null };

  interface Tag extends Model.TimestampTrackedModel {
    readonly title: string;
    readonly plural_title: string | null;
    readonly order: number;
    readonly color: string | null;
  }

  interface SimpleUser extends Model.Model {
    readonly first_name: string;
    readonly last_name: string;
    readonly full_name: string;
    readonly email: string;
    readonly profile_image: SavedImage | null;
  }

  interface NestedUser extends Model.SimpleUser {
    readonly username: string;
    readonly is_active: boolean;
    readonly is_staff: boolean;
    readonly is_admin: boolean;
    readonly is_superuser: boolean;
  }

  interface User extends Model.NestedUser, Model.TimestampTrackedModel {
    readonly last_login: null | string;
    readonly date_joined: string;
    readonly timezone: string;
    readonly is_first_time: boolean;
  }

  interface Fringe extends Model.TrackedModel {
    readonly color: string | null;
    readonly name: string | null;
    readonly description: string | null;
    readonly cutoff: number | null;
    readonly rate: number | null;
    readonly unit: Model.FringeUnit | null;
  }

  interface BaseBudget extends Model.TrackedModel {
    readonly name: string;
    readonly type: BudgetType;
  }

  interface SimpleTemplate extends Model.BaseBudget {
    readonly type: "template";
    readonly image: SavedImage | null;
    // The hidden attribute will not be present for non-community templates.
    readonly hidden?: boolean;
  }

  interface Template extends Model.SimpleTemplate {
    readonly estimated: number;
  }

  interface SimpleBudget extends Model.BaseBudget {
    readonly type: "budget";
    readonly image: SavedImage | null;
  }

  interface Budget extends Model.SimpleBudget {
    readonly project_number: number;
    readonly production_type: Model.ProductionType;
    readonly shoot_date: string;
    readonly delivery_date: string;
    readonly build_days: number;
    readonly prelight_days: number;
    readonly studio_shoot_days: number;
    readonly location_days: number;
    readonly actual: number;
    readonly variance: number;
    readonly estimated: number;
  }

  interface PdfBudget {
    readonly name: string;
    readonly estimated: number | null;
    readonly actual: number | null;
    readonly variance: number | null;
    readonly accounts: Model.PdfAccount[];
    readonly groups: Model.BudgetGroup[];
  }

  interface Group extends Model.TrackedModel {
    readonly name: string;
    readonly color: string | null;
    readonly children: ID[];
  }

  interface BudgetGroup extends Model.Group {
    readonly estimated: number;
    readonly variance?: number; // Will be undefined for Template Group(s).
    readonly actual?: number; // Will be undefined for Template Group(s).
  }

  // Represents a simple form of an Account, SubAccount or Detail (Nested SubAccount).
  interface Line extends Model.Model {
    readonly identifier: string | null;
    readonly type: LineType;
    readonly description: string | null;
  }

  interface SimpleAccount extends Model.Line {
    readonly type: "account";
  }

  interface SimpleSubAccount extends Model.Line {
    readonly type: "subaccount";
  }

  interface SubAccountTreeNode extends Model.SimpleSubAccount {
    readonly children: Model.SubAccountTreeNode[];
    readonly in_search_path: boolean;
  }

  type Tree = Model.AccountTreeNode[];

  // Abstract -- not meant for external reference.
  interface AbstractAccount extends Model.SimpleAccount {
    readonly estimated: number;
  }

  interface Account extends Model.AbstractAccount, Model.TrackedModel {
    readonly access: number[];
    readonly subaccounts: number[];
    readonly siblings?: Model.SimpleAccount[]; // Only included for detail endpoints.
    readonly ancestors?: Model.Entity[]; // Only included for detail endpoints.
    readonly variance?: number; // Will be undefined for Template Account(s).
    readonly actual?: number; // Will be undefined for Template Account(s).
  }

  interface PdfAccount extends Model.AbstractAccount {
    readonly variance: number; // Always Defined
    readonly actual: number; // Always Defined
    readonly subaccounts: Model.PdfSubAccount[];
    readonly groups: Model.BudgetGroup[];
  }

  // Abstract -- not meant for external reference.
  interface AbstractSubAccount extends Model.SimpleSubAccount {
    readonly quantity: number | null;
    readonly rate: number | null;
    readonly multiplier: number | null;
    readonly unit: Model.Tag | null;
    readonly estimated: number;
    readonly contact?: number | null; // Will be undefined for Template SubAccount(s).
  }

  interface SubAccount extends Model.AbstractSubAccount, Model.TrackedModel {
    readonly subaccounts: number[];
    readonly object_id: number; // Not applicable for PDF case.
    readonly parent_type: "account" | "subaccount"; // Not applicable for PDF case.
    readonly fringes: number[]; // Not applicable for PDF case.
    readonly siblings?: Model.SimpleSubAccount[]; // Only included for detail endpoints.
    readonly ancestors?: Model.Entity[]; // Only included for detail endpoints.
    readonly variance?: number; // Will be undefined for Template SubAccount(s).
    readonly actual?: number; // Will be undefined for Template SubAccount(s).
  }

  interface PdfSubAccount extends Model.AbstractSubAccount {
    readonly variance: number; // Always Defined
    readonly actual: number; // Always Defined
    readonly subaccounts: PdfSubAccount[];
    readonly groups: Model.BudgetGroup[];
  }

  interface Actual extends Model.TrackedModel {
    readonly contact: number | null;
    readonly description: string | null;
    readonly purchase_order: string | null;
    readonly date: string | null;
    readonly payment_id: string | null;
    readonly value: number | null;
    readonly payment_method: Model.PaymentMethod | null;
    readonly subaccount: Model.SimpleSubAccount | null;
  }

  interface Comment extends Model.TimestampTrackedModel {
    readonly likes: Model.SimpleUser[];
    readonly user: Model.SimpleUser;
    readonly text: string;
    readonly object_id: number;
    readonly content_object_type: "budget" | "account" | "subaccount" | "comment";
    readonly comments: Model.Comment[];
  }

  interface ContactNamesAndImage {
    readonly image: SavedImage | null;
    readonly first_name: string | null;
    readonly last_name: string | null;
  }

  interface Contact extends Model.TimestampTrackedModel, ContactNamesAndImage {
    readonly type: Model.ContactType | null;
    readonly full_name: string;
    readonly company: string | null;
    readonly position: string | null;
    readonly rate: number | null;
    readonly city: string | null;
    readonly email: string | null;
    readonly phone_number: string | null;
    readonly created_at: string;
    readonly updated_at: string;
  }

  type UserWithImage =
    | (Model.User & { profile_image: SavedImage })
    | (Model.SimpleUser & { profile_image: SavedImage })
    | (Model.Contact & { image: SavedImage });

  type HistoryEventType = "field_alteration" | "create";

  interface PolymorphicEvent extends Model.Model {
    readonly created_at: string;
    readonly user: Model.SimpleUser;
    readonly type: Model.HistoryEventType;
    readonly content_object: Model.SimpleAccount | Model.SimpleSubAccount;
  }

  interface FieldAlterationEvent extends Model.PolymorphicEvent {
    readonly new_value: string | number | null;
    readonly old_value: string | number | null;
    readonly field: string;
  }

  interface CreateEvent extends Model.PolymorphicEvent {}

  type HistoryEvent = Model.FieldAlterationEvent | Model.CreateEvent;

  interface SimpleHeaderTemplate extends Model.TimestampTrackedModel {
    readonly id: ID;
    readonly name: string;
  }

  interface HeaderTemplate extends Model.SimpleHeaderTemplate {
    readonly header: RichText.Block[] | null;
    readonly left_image: SavedImage | null;
    readonly left_info: RichText.Block[] | null;
    readonly right_image: SavedImage | null;
    readonly right_info: RichText.Block[] | null;
  }
}
