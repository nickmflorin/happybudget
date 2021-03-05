/// <reference path="./http.d.ts" />
/// <reference path="./redux.d.ts" />
/// <reference path="./ui.d.ts" />

type ProductionTypeName = "Film" | "Episodic" | "Music Video" | "Commercial" | "Documentary" | "Custom";
type ProductionType = 0 | 1 | 2 | 3 | 4 | 5;

interface Model {
  id: number;
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
}

interface IAccount extends Model {
  readonly account_number: string;
  readonly description: string | null;
  readonly created_by: ISimpleUser | null;
  readonly updated_by: ISimpleUser | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly access: number[];
  readonly budget: number;
}

type UnitName = "Minutes" | "Hours" | "Weeks" | "Months" | "Days" | "Nights" | "";
type Unit = 0 | 1 | 2 | 3 | 4 | 5;
type ParentType = "subaccount" | "account";

interface ISubAccount extends Model {
  readonly name: string;
  readonly line: string;
  readonly description: string | null;
  readonly created_by: ISimpleUser | null;
  readonly updated_by: ISimpleUser | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly quantity: number | null;
  readonly rate: number | null;
  readonly multiplier: number | null;
  readonly unit: Unit | null;
  readonly unit_name: UnitName;
  readonly account: number;
  readonly parent: number;
  readonly parent_type: ParentType;
}
