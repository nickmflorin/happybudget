/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
namespace Model {
  /* eslint-disable no-shadow */
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface Model {
    readonly id: ID;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type PartialModel<M extends Model> = Partial<Omit<M, "id">> & Pick<M, "id">;

  type HttpModelType =
    | "markup"
    | "subaccount"
    | "account"
    | "group"
    | "fringe"
    | "budget"
    | "template"
    | "actual"
    | "contact"
    | "pdf-account"
    | "pdf-subaccount"
    | "pdf-budget";

  interface HttpModel {
    readonly id: number;
  }

  interface RowHttpModel<T extends HttpModelType = HttpModelType> extends HttpModel {
    readonly type: T;
    readonly order: string;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type GenericHttpModel<T extends HttpModelType> = {
    readonly type: T;
    readonly id: number;
  };

  interface Choice<I extends number, N extends string> {
    id: I;
    name: N;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type MarkupUnitId = 0 | 1;
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type MarkupUnitName = "Percent" | "Flat";
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type MarkupUnit = Choice<0, "Percent"> | Choice<1, "Flat">;

  type FringeUnitId = 0 | 1;
  type FringeUnitName = "Percent" | "Flat";
  type FringeUnit = Choice<FringeUnitId, FringeUnitName>;

  type ContactTypeName = "Contractor" | "Employee" | "Vendor";
  type ContactTypeId = 0 | 1 | 2;
  type ContactType = Choice<ContactTypeId, ContactTypeName>;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ParentType = "account" | "subaccount" | "budget";
  type BudgetDomain = "budget" | "template";

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Entity = Account | SubAccount | Budget | Template | Markup;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ModelWithColor = HttpModel & { color: Style.HexColor | null };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ModelWithName = HttpModel & { name: string | null };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ModelWithDescription = HttpModel & { description: string | null };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ModelWithIdentifier = HttpModel & { identifier: string | null };

  interface Tag extends HttpModel {
    readonly title: string;
    readonly plural_title: string | null;
    readonly order: number;
    readonly color: Style.HexColor | null;
  }

  interface SimpleUser extends HttpModel {
    readonly first_name: string;
    readonly last_name: string;
    readonly full_name: string;
    readonly email: string;
    readonly profile_image: SavedImage | null;
  }

  interface User extends SimpleUser {
    readonly last_login: null | string;
    readonly date_joined: string;
    readonly timezone: string;
    readonly is_first_time: boolean;
    readonly is_active: boolean;
    readonly is_staff: boolean;
    readonly is_admin: boolean;
    readonly is_superuser: boolean;
    readonly company: string | null;
    readonly position: string | null;
    readonly address: string | null;
    readonly phone_number: number | null;
  }

  interface SimpleAttachment extends HttpModel {
    readonly name: string;
    readonly extension: string;
    readonly url: string;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface Attachment extends SimpleAttachment {
    readonly size: number;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface Fringe extends RowHttpModel<"fringe"> {
    readonly color: Style.HexColor | null;
    readonly name: string | null;
    readonly description: string | null;
    readonly cutoff: number | null;
    readonly rate: number | null;
    readonly unit: FringeUnit | null;
  }

  interface SimpleMarkup {
    readonly id: number;
    readonly type: "markup";
    readonly identifier: string | null;
    readonly description: string | null;
  }

  type UnknownMarkup = SimpleMarkup & {
    readonly rate: number | null;
    readonly unit: MarkupUnit;
  };

  type FlatMarkup = Omit<UnknownMarkup, "unit"> & {
    readonly unit: Choice<1, "Flat">;
  };

  type PercentMarkup = Omit<UnknownMarkup, "unit"> & {
    readonly children: number[];
    readonly unit: Choice<0, "Percent">;
  };

  type Markup = FlatMarkup | PercentMarkup;

  interface BaseBudget extends HttpModel {
    readonly type: "budget";
    readonly name: string;
    readonly domain: BudgetDomain;
  }

  interface SimpleTemplate extends BaseBudget {
    readonly domain: "template";
    readonly image: SavedImage | null;
    // The hidden attribute will not be present for non-community templates.
    readonly hidden?: boolean;
    readonly updated_at: string;
  }

  interface Template extends SimpleTemplate {
    readonly nominal_value: number;
    readonly actual: number;
    readonly accumulated_fringe_contribution: number;
    readonly accumulated_markup_contribution: number;
  }

  interface SimpleBudget extends BaseBudget {
    readonly domain: "budget";
    readonly image: SavedImage | null;
    readonly updated_at: string;
  }

  interface Budget extends SimpleBudget {
    readonly nominal_value: number;
    readonly actual: number;
    readonly accumulated_fringe_contribution: number;
    readonly accumulated_markup_contribution: number;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface PdfBudget extends RowHttpModel<"pdf-budget"> {
    readonly name: string;
    readonly nominal_value: number;
    readonly actual: number;
    readonly accumulated_fringe_contribution: number;
    readonly accumulated_markup_contribution: number;
    readonly children: PdfAccount[];
    readonly groups: Group[];
    readonly children_markups: Markup[];
  }

  interface Group extends HttpModel {
    readonly type: "group";
    readonly name: string;
    readonly color: Style.HexColor | null;
    readonly children: number[];
  }

  interface LineMetrics {
    readonly nominal_value: number;
    readonly actual: number;
    readonly accumulated_fringe_contribution: number;
    readonly markup_contribution: number;
    readonly accumulated_markup_contribution: number;
  }

  interface SimpleAccount extends HttpModel {
    readonly identifier: string | null;
    readonly type: "account";
    readonly description: string | null;
  }

  interface SimpleSubAccount extends HttpModel {
    readonly identifier: string | null;
    readonly type: "subaccount";
    readonly description: string | null;
  }

  interface SubAccountOwnerTreeNode extends SimpleSubAccount {
    readonly children: OwnerTreeNode[];
    readonly in_search_path: boolean;
  }

  interface MarkupOwnerTreeNode extends SimpleMarkup {
    readonly in_search_path: boolean;
  }

  type OwnerTreeNode = SubAccountOwnerTreeNode | MarkupOwnerTreeNode;

  // Abstract -- not meant for external reference.
  interface AbstractAccount extends Omit<SimpleAccount, "type">, LineMetrics {}

  interface Account extends AbstractAccount, RowHttpModel<"account"> {
    readonly access: number[];
    readonly children: number[];
    readonly siblings?: SimpleAccount[]; // Only included for detail endpoints.
    readonly ancestors?: [SimpleBudget | SimpleTemplate]; // Only included for detail endpoints.
  }

  interface PdfAccount extends AbstractAccount, RowHttpModel<"pdf-account"> {
    readonly children: PdfSubAccount[];
    readonly groups: Group[];
    readonly children_markups: Markup[];
  }

  // Abstract -- not meant for external reference.
  interface AbstractSubAccount extends Omit<SimpleSubAccount, "type">, LineMetrics {
    readonly fringe_contribution: number;
    readonly quantity: number | null;
    readonly rate: number | null;
    readonly multiplier: number | null;
    readonly unit: Tag | null;
    readonly contact?: number | null; // Will be undefined for Template SubAccount(s).
  }

  interface SubAccount extends AbstractSubAccount, RowHttpModel<"subaccount"> {
    readonly children: number[];
    readonly object_id: number;
    readonly parent_type: "account" | "subaccount";
    readonly fringes: number[];
    readonly attachments: SimpleAttachment[];
    readonly siblings?: SimpleSubAccount[]; // Only included for detail endpoints.
    readonly ancestors?: [SimpleBudget | SimpleTemplate, SimpleAccount, ...Array<SimpleSubAccount>]; // Only included for detail endpoints.
  }

  interface PdfSubAccount extends AbstractSubAccount, RowHttpModel<"pdf-subaccount"> {
    readonly children: PdfSubAccount[];
    readonly groups: Group[];
    readonly children_markups: Markup[];
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface Actual extends RowHttpModel<"actual"> {
    readonly contact: number | null;
    readonly name: string | null;
    readonly notes: string | null;
    readonly purchase_order: string | null;
    readonly date: string | null;
    readonly payment_id: string | null;
    readonly value: number | null;
    readonly actual_type: Tag | null;
    readonly attachments: SimpleAttachment[];
    readonly owner: SimpleSubAccount | SimpleMarkup | null;
  }

  interface ContactNamesAndImage {
    readonly image: SavedImage | null;
    readonly first_name: string | null;
    readonly last_name: string | null;
  }

  interface Contact extends ContactNamesAndImage, RowHttpModel<"contact"> {
    readonly contact_type: ContactType | null;
    readonly full_name: string;
    readonly company: string | null;
    readonly position: string | null;
    readonly rate: number | null;
    readonly city: string | null;
    readonly email: string | null;
    readonly phone_number: string | null;
    readonly attachments: SimpleAttachment[];
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type UserWithImage =
    | (User & { profile_image: SavedImage })
    | (SimpleUser & { profile_image: SavedImage })
    | (Contact & { image: SavedImage });

  interface SimpleHeaderTemplate extends HttpModel {
    readonly name: string;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface HeaderTemplate extends SimpleHeaderTemplate {
    readonly header: string | null;
    readonly left_image: SavedImage | null;
    readonly left_info: string | null;
    readonly right_image: SavedImage | null;
    readonly right_info: string | null;
  }
}
