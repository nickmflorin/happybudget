/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Model {
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
  type ProductionTypeModel = ChoiceModel<ProductionTypeId, ProductionTypeName>;

  type PaymentMethodName = "Check" | "Card" | "Wire";
  type PaymentMethodId = 0 | 1 | 2;
  type PaymentMethod = ChoiceModel<PaymentMethodId, PaymentMethodName>;

  type SubAccountUnitName =
    | "Minutes"
    | "Hours"
    | "Weeks"
    | "Months"
    | "Days"
    | "Nights"
    | "Allow"
    | "Flat"
    | "Feet"
    | "Fare"
    | "Units"
    | "";
  type SubAccountUnitId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  type SubAccountUnit = ChoiceModel<SubAccountUnitId, SubAccountUnitName>;

  type FringeUnitId = 0 | 1;
  type FringeUnitName = "Percent" | "Flat";
  type FringeUnit = ChoiceModel<FringeUnitId, FringeUnitName>;

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
  type ContactRole = ChoiceModel<ContactRoleId, ContactRoleName>;

  type EntityType = "budget" | "account" | "subaccount";
  type BudgetItemType = "subaccount" | "account";
  type CommentParentType = "budget" | "account" | "subaccount" | "comment";

  interface Entity extends Model.Model {
    readonly identifier: string | null;
    readonly type: Model.EntityType;
    readonly name: string | null;
    readonly description: string | null;
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
    readonly profile_image: string;
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
    readonly name: string;
    readonly description: string | null;
    readonly cutoff: number | null;
    readonly rate: number;
    readonly unit: Model.FringeUnit;
  }

  interface Budget extends Model.Model {
    readonly id: number;
    readonly name: string;
    readonly created_by: number;
    readonly project_number: number;
    readonly production_type: Model.ProductionType;
    readonly created_at: string;
    readonly updated_at: string;
    readonly shoot_date: string;
    readonly delivery_date: string;
    readonly build_days: number;
    readonly prelight_days: number;
    readonly studio_shoot_days: number;
    readonly location_days: number;
    readonly trash: boolean;
    readonly estimated: number | null;
    readonly actual: number | null;
    readonly variance: number | null;
  }

  interface SimpleBudgetItem extends Model.Model {
    readonly identifier: string;
  }

  interface BudgetItem extends Model.SimpleBudgetItem {
    readonly description: string;
    readonly type: Model.BudgetItemType;
  }

  interface BudgetItemNode extends Model.BudgetItem {
    readonly children: Model.BudgetItemTreeNode[];
  }

  interface Group<C extends Model.Model> extends Model.TrackedModel {
    readonly children: C[];
    readonly name: string;
    readonly color: string;
    readonly estimated: number | null;
    readonly variance: number | null;
    readonly actual: number | null;
  }

  interface Account extends Model.Model {
    readonly description: string;
    readonly type: Model.BudgetItemType;
    readonly identifier: string;
    readonly created_by: number | null;
    readonly updated_by: number | null;
    readonly created_at: string;
    readonly updated_at: string;

    readonly description: string | null;
    readonly access: number[];
    readonly ancestors: Model.Entity[];
    readonly estimated: number | null;
    readonly variance: number | null;
    readonly actual: number | null;
    readonly subaccounts: Model.SimpleSubAccount[];
    readonly type: "account";
    readonly group: number | null;
    readonly siblings: Model.Entity[];
  }

  interface SimpleAccount extends Model.SimpleBudgetItem {}

  interface SimpleSubAccount extends Model.Model {
    readonly name: string;
  }

  interface SubAccount extends Model.BudgetItem, Model.TrackedModel {
    readonly description: string | null;
    readonly name: string | null;
    readonly quantity: number | null;
    readonly rate: number | null;
    readonly multiplier: number | null;
    readonly unit: Model.SubAccountUnit | null;
    readonly account: number;
    readonly object_id: number;
    readonly type: "subaccount";
    readonly parent_type: Model.BudgetItemType;
    readonly ancestors: Model.Entity[];
    readonly estimated: number | null;
    readonly variance: number | null;
    readonly actual: number | null;
    readonly subaccounts: Model.SimpleSubAccount[];
    readonly group: number | null;
    readonly siblings: Model.Entity[];
    readonly fringes: number[];
  }

  interface Actual extends Model.TrackedModel {
    readonly vendor: string | null;
    readonly description: string | null;
    readonly purchase_order: string | null;
    readonly date: string | null;
    readonly payment_id: string | null;
    readonly value: string | null;
    readonly payment_method: Model.PaymentMethod | null;
    readonly object_id: number;
    readonly parent_type: Model.BudgetItemType;
  }

  interface Comment extends Model.Model {
    readonly created_at: string;
    readonly updated_at: string;
    readonly likes: Model.SimpleUser[];
    readonly user: Model.SimpleUser;
    readonly text: string;
    readonly object_id: number;
    readonly content_object_type: Model.CommentParentType;
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
  type HistoryEventContentObjectType = "account" | "subaccount" | "actual";

  interface HistoryEventContentObject {
    readonly id: number;
    readonly identifier?: string;
    readonly description: string | null;
    readonly type: Model.HistoryEventContentObjectType;
  }

  interface PolymorphicEvent extends Model.Model {
    readonly created_at: string;
    readonly user: Model.SimpleUser;
    readonly type: Model.HistoryEventType;
    readonly content_object: Model.HistoryEventContentObject;
  }

  interface FieldAlterationEvent extends Model.PolymorphicEvent {
    readonly new_value: string | number | null;
    readonly old_value: string | number | null;
    readonly field: string;
  }

  interface CreateEvent extends Model.PolymorphicEvent {}

  type HistoryEvent = Model.FieldAlterationEvent | Model.CreateEvent;
}
