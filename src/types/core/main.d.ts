/// <reference path="./http.d.ts" />
/// <reference path="./redux.d.ts" />
/// <reference path="./ui.d.ts" />

type ProductionType = "Film" | "Episodic" | "Music" | "Commercial" | "Documentary" | "Custom";

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
}

interface IBudget extends Model {
  id: number;
  author: IUser;
  project_number: number;
  production_type: number;
  production_type_name: ProductionType;
  created_at: string;
  shoot_date: string;
  delivery_date: string;
  build_days: number;
  prelight_days: number;
  studio_shoot_days: number;
  location_days: number;
}
