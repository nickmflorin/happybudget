/// <reference path="./http.d.ts" />
/// <reference path="./redux.d.ts" />

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
