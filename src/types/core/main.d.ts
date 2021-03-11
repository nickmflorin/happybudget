/// <reference path="./http.d.ts" />
/// <reference path="./redux.d.ts" />
/// <reference path="./ui.d.ts" />
/// <reference path="./table.d.ts" />

type ProductionTypeName = "Film" | "Episodic" | "Music Video" | "Commercial" | "Documentary" | "Custom";
type ProductionType = 0 | 1 | 2 | 3 | 4 | 5;

type PaymentMethodName = "Check" | "Card" | "Wire";
type PaymentMethod = 0 | 1 | 2;

type AncestorType = "budget" | "account" | "subaccount";
type UnitName = "Minutes" | "Hours" | "Weeks" | "Months" | "Days" | "Nights" | "";
type Unit = 0 | 1 | 2 | 3 | 4 | 5;
type BudgetItemType = "subaccount" | "account";

interface Model {
  id: number;
}

interface TrackedModel extends Model {
  readonly created_by: ISimpleUser | null;
  readonly updated_by: ISimpleUser | null;
  readonly created_at: string;
  readonly updated_at: string;
}

interface ISimpleUser extends Model {
  readonly first_name?: string;
  readonly last_name?: string;
  readonly full_name: string;
  readonly email: string;
  readonly username: string;
  readonly is_active: boolean;
  readonly is_staff: boolean;
  readonly is_admin: boolean;
  readonly is_superuser: boolean;
}

interface IUser extends ISimpleUser {
  readonly last_login: null | string;
  readonly date_joined: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly timezone: string;
}

interface IBudget extends Model {
  readonly id: number;
  readonly name: string;
  readonly author: IUser;
  readonly project_number: number;
  readonly production_type: ProductionType;
  readonly production_type_name: ProductionTypeName;
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
}

interface IAncestor {
  id: number;
  identifier: string;
  type: AncestorType;
}

interface IBudgetItem extends TrackedModel {
  readonly identifier: string;
  readonly description: string | null;
  readonly budget: number;
  readonly type: "account" | "subaccount";
}

interface IAccount extends IBudgetItem {
  readonly access: number[];
  readonly ancestors: IAncestor[];
  readonly estimated: number | null;
  readonly variance: number | null;
  readonly subaccounts: ISimpleSubAccount[];
}

interface ISimpleSubAccount extends Model {
  readonly name: string;
}

interface ISubAccount extends IBudgetItem {
  readonly name: string | null;
  readonly quantity: number | null;
  readonly rate: number | null;
  readonly multiplier: number | null;
  readonly unit: Unit | null;
  readonly unit_name: UnitName;
  readonly account: number;
  readonly parent: number;
  readonly parent_type: BudgetItemType;
  readonly ancestors: IAncestor[];
  readonly estimated: number | null;
  readonly variance: number | null;
  readonly subaccounts: ISimpleSubAccount[];
}

interface IActual extends TrackedModel {
  readonly vendor: string | null;
  readonly description: string | null;
  readonly purchase_order: string | null;
  readonly date: string | null;
  readonly payment_id: string | null;
  readonly value: string | null;
  readonly payment_method: PaymentMethod;
  readonly payment_method_name: PaymentMethodName;
  readonly parent: number;
  readonly parent_type: BudgetItemType;
}
