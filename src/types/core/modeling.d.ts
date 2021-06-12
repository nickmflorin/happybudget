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

  interface IModel<M extends Model.Model> extends M {}

  interface HttpModel extends Model.Model {}

  interface IHttpModel<M extends Model.HttpModel, P extends Http.ModelPayload<M> = Http.ModelPayload<M>> extends M {
    readonly id: number;
    refresh: (options: Http.RequestOptions) => Promise<void>;
    patch: (payload: P | FormData, options: Http.RequestOptions) => Promise<Model.HttpModel>;
  }

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
  type ContactRole = Model.Choice<ContactRoleId, ContactRoleName>;

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
    readonly is_first_time: boolean;
  }

  interface Fringe extends Model.Model {
    readonly color: string | null;
    readonly name: string | null;
    readonly description: string | null;
    readonly cutoff: number | null;
    readonly rate: number | null;
    readonly unit: Model.FringeUnit | null;
    readonly created_by: number | null;
    readonly updated_by: number | null;
    readonly created_at: string;
    readonly updated_at: string;
  }

  interface BaseBudget extends Model.HttpModel {
    readonly name: string;
    readonly type: BudgetType;
    readonly created_at: string;
    readonly updated_at: string;
    readonly created_by: number;
    readonly updated_by: number | null;
  }

  interface SimpleTemplate extends Model.BaseBudget {
    readonly type: "template";
    readonly image: string | null;
    // The hidden attribute will not be present for non-community templates.
    readonly hidden?: boolean;
  }

  interface ISimpleTemplate extends Model.IModel<Model.SimpleTemplate> {}

  interface Template extends Model.SimpleTemplate {
    readonly estimated: number | null;
  }

  interface ITemplate extends Model.IHttpModel<Model.Template, Http.TemplatePayload> {}

  interface SimpleBudget extends Model.BaseBudget {
    readonly type: "budget";
    readonly image: string | null;
  }

  interface ISimpleBudget extends Model.IModel<Model.SimpleBudget> {}

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

  interface IBudget extends Model.IHttpModel<Model.Budget, Http.BudgetPayload> {}

  interface Group extends Model.Model {
    readonly children: number[];
    readonly name: string;
    readonly color: string | null;
    readonly estimated: number | null;
    readonly children: number[];
    readonly created_by: number | null;
    readonly updated_by: number | null;
    readonly created_at: string;
    readonly updated_at: string;
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
    readonly in_search_path: boolean;
  }

  interface AccountTreeNode extends Model.SimpleAccount {
    readonly children: Model.SubAccountTreeNode[];
    readonly in_search_path: boolean;
  }

  type Tree = Model.AccountTreeNode[];

  interface Account extends Model.SimpleAccount {
    readonly access: number[];
    readonly ancestors: Model.Entity[];
    readonly estimated: number | null;
    readonly subaccounts: number[];
    readonly group: number | null;
    readonly siblings: Model.SimpleAccount[];
    readonly budget: number;
    readonly created_by: number | null;
    readonly updated_by: number | null;
    readonly created_at: string;
    readonly updated_at: string;
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

  interface SubAccount extends Model.SimpleSubAccount {
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
    readonly created_by: number | null;
    readonly updated_by: number | null;
    readonly created_at: string;
    readonly updated_at: string;
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

  interface Actual extends Model.Model {
    readonly vendor: string | null;
    readonly description: string | null;
    readonly purchase_order: string | null;
    readonly date: string | null;
    readonly payment_id: string | null;
    readonly value: string | null;
    readonly payment_method: Model.PaymentMethod | null;
    readonly account: Model.SimpleAccount | Model.SimpleSubAccount | null;
    readonly created_by: number | null;
    readonly updated_by: number | null;
    readonly created_at: string;
    readonly updated_at: string;
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
    readonly last_name: string | null;
    readonly full_name: string;
    readonly email: string | null;
    readonly created_at: string;
    readonly updated_at: string;
    readonly role: Model.ContactRole | null;
    readonly city: string | null;
    readonly country: string | null;
    readonly phone_number: string | null;
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
