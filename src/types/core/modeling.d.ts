interface DistinctOptionModel<I extends number, N extends string> {
  id: I;
  name: N;
}

type ProductionTypeName = "Film" | "Episodic" | "Music Video" | "Commercial" | "Documentary" | "Custom";
type ProductionType = 0 | 1 | 2 | 3 | 4 | 5;
type ProductionTypeModel = DistinctOptionModel<ProductionType, ProductionTypeName>;

type PaymentMethodName = "Check" | "Card" | "Wire";
type PaymentMethod = 0 | 1 | 2;
type PaymentMethodModel = DistinctOptionModel<PaymentMethod, PaymentMethodName>;

type EntityType = "budget" | "account" | "subaccount";
type BudgetItemType = "subaccount" | "account";
type CommentParentType = "budget" | "account" | "subaccount" | "comment";

type UnitName = "Minutes" | "Hours" | "Weeks" | "Months" | "Days" | "Nights" | "";
type Unit = 0 | 1 | 2 | 3 | 4 | 5;
type UnitModel = DistinctOptionModel<Unit, UnitName>;

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
type ContactRole = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type ContactRoleModel = { id: ContactRole; name: ContactRoleName };

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
  readonly first_name: string;
  readonly last_name: string;
  readonly full_name: string;
  readonly email: string;
  readonly profile_image: string;
}

interface INestedUser extends ISimpleUser {
  readonly username: string;
  readonly is_active: boolean;
  readonly is_staff: boolean;
  readonly is_admin: boolean;
  readonly is_superuser: boolean;
}

interface IUser extends INestedUser {
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
  readonly actual: number | null;
  readonly variance: number | null;
}

interface IAncestor {
  id: number;
  identifier: string;
  type: EntityType;
}

interface ISimpleBudgetItem extends Model {
  readonly identifier: string;
}

interface IBudgetItem extends ISimpleBudgetItem {
  readonly description: string;
  readonly type: BudgetItemType;
}

interface IBudgetItemNode extends IBudgetItem {
  readonly children: IBudgetItemTreeNode[];
}

interface INestedGroup extends TrackedModel {
  readonly name: string;
  readonly color: string;
  readonly estimated: number | null;
  readonly variance: number | null;
  readonly actual: number | null;
}

interface IGroup<C extends Model> extends INestedGroup {
  readonly children: C[];
}

interface IAccount extends IBudgetItem, TrackedModel {
  readonly description: string | null;
  readonly access: number[];
  readonly ancestors: IAncestor[];
  readonly estimated: number | null;
  readonly variance: number | null;
  readonly actual: number | null;
  readonly subaccounts: ISimpleSubAccount[];
  readonly type: "account";
  readonly group: INestedGroup | null;
}

interface ISimpleAccount extends ISimpleBudgetItem {}

interface ISimpleSubAccount extends Model {
  readonly name: string;
}

interface ISubAccount extends IBudgetItem, TrackedModel {
  readonly description: string | null;
  readonly name: string | null;
  readonly quantity: number | null;
  readonly rate: number | null;
  readonly multiplier: number | null;
  readonly unit: Unit | null;
  readonly unit_name: UnitName;
  readonly account: number;
  readonly object_id: number;
  readonly type: "subaccount";
  readonly parent_type: BudgetItemType;
  readonly ancestors: IAncestor[];
  readonly estimated: number | null;
  readonly variance: number | null;
  readonly actual: number | null;
  readonly subaccounts: ISimpleSubAccount[];
  readonly group: INestedGroup | null;
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
  readonly object_id: number;
  readonly parent_type: BudgetItemType;
}

interface IComment extends Model {
  readonly created_at: string;
  readonly updated_at: string;
  readonly likes: ISimpleUser[];
  readonly user: ISimpleUser;
  readonly text: string;
  readonly object_id: number;
  readonly content_object_type: CommentParentType;
  readonly comments: IComment[];
}

interface IContact extends Model {
  readonly first_name: string;
  readonly last_name: string;
  readonly full_name: string;
  readonly email: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly role: ContactRole;
  readonly role_name: ContactRoleName;
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
  readonly type: HistoryEventContentObjectType;
}

interface PolymorphicEvent extends Model {
  readonly created_at: string;
  readonly user: ISimpleUser;
  readonly type: HistoryEventType;
  readonly content_object: HistoryEventContentObject;
}

interface FieldAlterationEvent extends PolymorphicEvent {
  readonly new_value: string | number | null;
  readonly old_value: string | number | null;
  readonly field: string;
}

interface CreateEvent extends PolymorphicEvent {}

type HistoryEvent = FieldAlterationEvent | CreateEvent;
