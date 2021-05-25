/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Model {
  interface StringObj {
    [key: string]: any;
  }

  interface M {
    readonly id: string | number;
  }

  /* eslint-disable no-shadow */
  interface Model {
    readonly id: number;
  }

  interface Choice<I extends number, N extends string> {
    id: I;
    name: N;
  }

  type ProductionTypeName = "Film" | "Episodic" | "Music Video" | "Commercial" | "Documentary" | "Custom";
  type ProductionTypeId = 0 | 1 | 2 | 3 | 4 | 5;
  type ProductionType = Choice<ProductionTypeId, ProductionTypeName>;

  type PaymentMethodName = "Check" | "Card" | "Wire";
  type PaymentMethodId = 0 | 1 | 2;
  type PaymentMethod = Choice<PaymentMethodId, PaymentMethodName>;

  type FringeUnitId = 0 | 1;
  type FringeUnitName = "Percent" | "Flat";
  type FringeUnit = Choice<FringeUnitId, FringeUnitName>;

  type ContactRoleName =
    | "Producer"
    | "Executive Producer"
    | "Production Manager"
    | "Production Designer"
    | "Actor"
    | "Director"
    | "Medic"
    | "Wardrobe"
    | "Writer"
    | "Client"
    | "Other";
  type ContactRoleId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  type ContactRole = Choice<ContactRoleId, ContactRoleName>;

  type EntityType = "budget" | "template" | "account" | "subaccount";
  type BudgetType = "budget" | "template";

  type ModelWithColor = Model.Model & { color: string | null };
  type ModelWithName = Model.Model & { name: string | null };

  interface Tag extends Model.Model {
    readonly created_at: string;
    readonly updated_at: string;
    readonly title: string;
    readonly order: number;
    readonly color: string | null;
  }

  interface TrackedModel extends Model.Model {
    readonly created_by: number | null;
    readonly updated_by: number | null;
    readonly created_at: string;
    readonly updated_at: string;
  }

  interface SimpleUser extends Model.Model {
    readonly first_name: string;
    readonly last_name: string;
    readonly full_name: string;
    readonly email: string;
    readonly profile_image: string | null;
  }

  interface NestedUser extends Model.SimpleUser {
    readonly username: string;
    readonly is_active: boolean;
    readonly is_staff: boolean;
    readonly is_admin: boolean;
    readonly is_superuser: boolean;
  }

  interface User extends Model.NestedUser {
    readonly last_login: null | string;
    readonly date_joined: string;
    readonly created_at: string;
    readonly updated_at: string;
    readonly timezone: string;
  }

  interface Fringe extends Model.TrackedModel {
    readonly color: string | null;
    readonly name: string;
    readonly description: string | null;
    readonly cutoff: number | null;
    readonly rate: number;
    readonly unit: Model.FringeUnit;
  }

  interface BaseBudget extends Model {
    readonly name: string;
    readonly type: BudgetType;
  }

  interface SimpleTemplate extends Model.BaseBudget {
    readonly type: "template";
    readonly created_at: string;
    readonly updated_at: string;
    readonly created_by: number;
    readonly image: string | null;
  }

  interface Template extends Model.SimpleTemplate {
    readonly estimated: number | null;
  }

  interface SimpleBudget extends Model.BaseBudget {
    readonly type: "budget";
    readonly created_at: string;
    readonly updated_at: string;
    readonly created_by: number;
    readonly image: string | null;
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
    readonly actual: number | null;
    readonly variance: number | null;
    readonly estimated: number | null;
  }

  interface Group extends Model.TrackedModel {
    readonly children: number[];
    readonly name: string;
    readonly color: string | null;
    readonly estimated: number | null;
    readonly children: number[];
  }

  interface BudgetGroup extends Model.Group {
    readonly variance: number | null;
    readonly actual: number | null;
  }

  interface TemplateGroup extends Model.Group {}

  interface SimpleAccount extends Model.Model {
    readonly identifier: string | null;
    readonly type: "account";
    readonly description: string | null;
  }

  interface SubAccountTreeNode extends Model.SimpleSubAccount {
    readonly children: Model.SubAccountTreeNode[];
  }

  interface AccountTreeNode extends Model.SimpleAccount {
    readonly children: Model.SubAccountTreeNode[];
  }

  type Tree = Model.AccountTreeNode[];

  interface Account extends Model.SimpleAccount, Model.TrackedModel {
    readonly access: number[];
    readonly ancestors: Model.Entity[];
    readonly estimated: number | null;
    readonly subaccounts: number[];
    readonly group: number | null;
    readonly siblings: Model.SimpleAccount[];
    readonly budget: number;
  }

  interface BudgetAccount extends Model.Account {
    readonly variance: number | null;
    readonly actual: number | null;
  }

  interface TemplateAccount extends Model.Account {}

  interface SimpleSubAccount extends Model.Model {
    readonly name: string | null;
    readonly type: "subaccount";
    readonly identifier: string | null;
    readonly description: string | null;
  }

  interface SubAccount extends Model.SimpleSubAccount, Model.TrackedModel {
    readonly quantity: number | null;
    readonly rate: number | null;
    readonly multiplier: number | null;
    readonly unit: Model.Tag | null;
    readonly account: number;
    readonly object_id: number;
    readonly type: "subaccount";
    readonly parent_type: "account" | "subaccount";
    readonly estimated: number | null;
    readonly group: number | null;
    readonly fringes: number[];
    readonly subaccounts: number[];
    readonly siblings: Model.SimpleSubAccount[];
    readonly ancestors: Model.Entity[];
  }

  interface BudgetSubAccount extends Model.SubAccount {
    readonly variance: number | null;
    readonly actual: number | null;
  }

  interface TemplateSubAccount extends Model.SubAccount {}

  type TemplateForm = Model.Template | Model.SimpleTemplate;
  type BudgetForm = Model.Budget | Model.SimpleBudget;
  type SubAccountForm = Model.BudgetSubAccount | Model.TemplateSubAccount | Model.SimpleSubAccount;
  type AccountForm = Model.BudgetAccount | Model.TemplateAccount | Model.SimpleAccount;
  type SimpleLineItem = Model.SimpleAccount | Model.SimpleSubAccount;
  type BudgetLineItem = Model.BudgetAccount | Model.BudgetSubAccount;
  type SimpleEntity = Model.SimpleAccount | Model.SimpleBudget | Model.SimpleSubAccount | Model.SimpleTemplate;
  type Entity = Model.Account | Model.Budget | Model.SubAccount | Model.Template;

  interface Actual extends Model.TrackedModel {
    readonly vendor: string | null;
    readonly description: string | null;
    readonly purchase_order: string | null;
    readonly date: string | null;
    readonly payment_id: string | null;
    readonly value: string | null;
    readonly payment_method: Model.PaymentMethod | null;
    readonly account: Model.SimpleAccount | Model.SimpleSubAccount | null;
  }

  interface Comment extends Model.Model {
    readonly created_at: string;
    readonly updated_at: string;
    readonly likes: Model.SimpleUser[];
    readonly user: Model.SimpleUser;
    readonly text: string;
    readonly object_id: number;
    readonly content_object_type: "budget" | "account" | "subaccount" | "comment";
    readonly comments: Model.Comment[];
  }

  interface Contact extends Model.Model {
    readonly first_name: string;
    readonly last_name: string;
    readonly full_name: string;
    readonly email: string;
    readonly created_at: string;
    readonly updated_at: string;
    readonly role: Model.ContactRole;
    readonly city: string;
    readonly country: string;
    readonly phone_number: string;
    readonly email: string;
  }

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
}
