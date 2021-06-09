import Model from "./Model";

export default class User extends Model implements Model.User {
  public readonly last_login: string | null = null;
  public readonly date_joined: string = "";
  public readonly created_at: string = "";
  public readonly updated_at: string = "";
  public readonly timezone: string = "";
  public readonly is_first_time: boolean = false;
  public readonly first_name: string = "";
  public readonly last_name: string = "";
  public readonly full_name: string = "";
  public readonly email: string = "";
  public readonly profile_image: string | null = null;
  public readonly username: string = "";
  public readonly is_active: boolean = true;
  public readonly is_staff: boolean = false;
  public readonly is_admin: boolean = false;
  public readonly is_superuser: boolean = false;

  constructor(data: Model.User) {
    super(data);
    this.update(data);
  }
}
