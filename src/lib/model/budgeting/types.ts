import * as fs from "../../fs";
import * as ui from "../../ui";
import { enumeratedLiterals, EnumeratedLiteralType } from "../../util";
import * as attachment from "../attachment";
import * as auth from "../auth";
import * as choice from "../choice";
import * as tagging from "../tagging";
import * as types from "../types";
import * as user from "../user";

export const CollaboratorAccessTypeNames = enumeratedLiterals([
  "View Only",
  "Owner",
  "Editor",
] as const);
export type CollaboratorAccessTypeName = EnumeratedLiteralType<typeof CollaboratorAccessTypeNames>;

export const CollaboratorAccessTypeSlugs = enumeratedLiterals([
  "view_only",
  "owner",
  "editor",
] as const);
export type CollaboratorAccessTypeSlug = EnumeratedLiteralType<typeof CollaboratorAccessTypeSlugs>;

export type CollaboratorAccessType =
  | choice.Choice<0, "View Only", "view_only">
  | choice.Choice<1, "Editor", "editor">
  | choice.Choice<2, "Owner", "owner">;

export const CollaboratorAccessTypes = choice.choices([
  choice.choice(0, CollaboratorAccessTypeNames.VIEW_ONLY, CollaboratorAccessTypeSlugs.VIEW_ONLY),
  choice.choice(1, CollaboratorAccessTypeNames.EDITOR, CollaboratorAccessTypeSlugs.EDITOR),
  choice.choice(2, CollaboratorAccessTypeNames.OWNER, CollaboratorAccessTypeSlugs.OWNER),
] as const);

export const ActualImportSourceNames = enumeratedLiterals(["Bank Account"] as const);
export type ActualImportSourceName = EnumeratedLiteralType<typeof ActualImportSourceNames>;
export const ActualImportSourceSlugs = enumeratedLiterals(["bank_account"] as const);
export type ActualImportSourceSlug = EnumeratedLiteralType<typeof ActualImportSourceSlugs>;

export type ActualImportSource = choice.Choice<0, "Bank Account", "bank_account">;

export const ActualImportSources = choice.choices([
  choice.choice(0, ActualImportSourceNames.BANK_ACCOUNT, ActualImportSourceSlugs.BANK_ACCOUNT),
] as const);

export const ParentTypes = enumeratedLiterals(["account", "subaccount", "budget"] as const);

type _ChildrenModel = Account | SubAccount | SimpleAccount | SimpleSubAccount;

export type ParentType<T extends _ChildrenModel | _ChildrenModel["type"] = _ChildrenModel["type"]> =
  T extends _ChildrenModel
    ? ParentType<T["type"]>
    : T extends _ChildrenModel["type"]
    ? {
        account: "budget";
        subaccount: "account" | "subaccount";
      }[T]
    : never;

export type ParentModel<
  T extends _ChildrenModel | _ChildrenModel["type"] = _ChildrenModel["type"],
> = T extends _ChildrenModel
  ? ParentModel<T["type"]>
  : T extends _ChildrenModel["type"]
  ? {
      account: Budget | Template;
      subaccount: Account | SubAccount;
    }[T]
  : never;

export const BudgetDomains = enumeratedLiterals(["budget", "template"] as const);
export type BudgetDomain = EnumeratedLiteralType<typeof BudgetDomains>;

export const FringeUnitNames = enumeratedLiterals(["percent", "flat"] as const);
export type FringeUnitName = EnumeratedLiteralType<typeof FringeUnitNames>;
export const FringeUnitSlugs = enumeratedLiterals(["percent", "flat"] as const);
export type FringeUnitSlug = EnumeratedLiteralType<typeof FringeUnitSlugs>;

export type FringeUnit = choice.Choice<0, "Percent", "percent"> | choice.Choice<1, "Flat", "flat">;

export const FringeUnits = choice.choices([
  choice.choice(0, FringeUnitNames.PERCENT, FringeUnitSlugs.PERCENT),
  choice.choice(1, FringeUnitNames.FLAT, FringeUnitSlugs.FLAT),
] as const);

export type Fringe = types.RowTypedApiModel<"fringe"> & {
  readonly color: ui.HexColor | null;
  readonly name: string | null;
  readonly description: string | null;
  readonly cutoff: number | null;
  readonly rate: number | null;
  readonly unit: FringeUnit | null;
};

export const MarkupUnitNames = enumeratedLiterals(["Percent", "Flat"] as const);
export type MarkupUnitName = EnumeratedLiteralType<typeof MarkupUnitNames>;

export const MarkupUnitSlugs = enumeratedLiterals(["percent", "flat"] as const);
export type MarkupUnitSlug = EnumeratedLiteralType<typeof MarkupUnitSlugs>;

export type MarkupUnit = choice.Choice<0, "Percent", "percent"> | choice.Choice<1, "Flat", "flat">;

export const MarkupUnits = choice.choices([
  choice.choice(0, MarkupUnitNames.PERCENT, MarkupUnitSlugs.PERCENT),
  choice.choice(1, MarkupUnitNames.FLAT, MarkupUnitSlugs.FLAT),
] as const);

export type SimpleMarkup = types.TypedApiModel<"markup"> & {
  readonly identifier: string | null;
  readonly description: string | null;
};

export type UnknownMarkup = SimpleMarkup & {
  readonly rate: number | null;
  readonly unit: MarkupUnit;
};

export type FlatMarkup = Omit<UnknownMarkup, "unit"> & {
  readonly unit: choice.Choice<1, "Flat", "flat">;
  readonly actual: number;
};

export type PercentMarkup = Omit<UnknownMarkup, "unit"> & {
  readonly children: number[];
  readonly unit: choice.Choice<0, "Percent", "percent">;
  readonly actual: number;
};

export type Markup = FlatMarkup | PercentMarkup;

export type AbstractBudget = types.TypedApiModel<"budget"> & {
  readonly name: string;
  readonly domain: BudgetDomain;
  readonly updated_at: string;
  readonly image: fs.SavedImage | null;
  /* A budget will not have an updated by field in the case that the user who updated the budget has
     since been deleted. */
  readonly updated_by: Omit<user.SimpleUser, "profile_image"> | null;
};

export type SimpleTemplate = AbstractBudget & {
  readonly domain: "template";
  // The hidden attribute will not be present for non-community templates.
  readonly hidden?: boolean;
};

export type Template = SimpleTemplate & {
  readonly nominal_value: number;
  readonly actual: number;
  readonly accumulated_fringe_contribution: number;
  readonly accumulated_markup_contribution: number;
};

export type SimpleCollaboratingBudget = AbstractBudget & {
  readonly domain: "budget";
};

export type SimpleBudget = SimpleCollaboratingBudget & {
  readonly is_permissioned: boolean;
};

type _Budget = auth.PublicTypedApiModel<"budget"> &
  Omit<SimpleBudget, "is_permissioned"> & {
    readonly nominal_value: number;
    readonly actual: number;
    readonly accumulated_fringe_contribution: number;
    readonly accumulated_markup_contribution: number;
  };

export type AnotherUserBudget = _Budget;
export type UserBudget = _Budget & {
  readonly is_permissioned: boolean;
};
export type Budget = AnotherUserBudget | UserBudget;
export type BaseBudget = Budget | Template;

export type Collaborator = types.TypedApiModel<"collaborator"> & {
  readonly created_at: string;
  readonly updated_at: string;
  readonly access_type: CollaboratorAccessType;
  readonly user: user.SimpleUser;
};

export interface PdfBudget extends types.TypedApiModel<"pdf-budget"> {
  readonly name: string;
  readonly nominal_value: number;
  readonly actual: number;
  readonly accumulated_fringe_contribution: number;
  readonly accumulated_markup_contribution: number;
  readonly children: PdfAccount[];
  readonly groups: Group[];
  readonly children_markups: Markup[];
}

export type Group = types.TypedApiModel<"group"> & {
  readonly name: string;
  readonly color: ui.HexColor | null;
  readonly children: number[];
};

export type LineMetrics = {
  readonly nominal_value: number;
  readonly actual: number;
  readonly accumulated_fringe_contribution: number;
  readonly markup_contribution: number;
  readonly accumulated_markup_contribution: number;
};

export type SimpleAccount = types.TypedApiModel<"account"> & {
  readonly identifier: string | null;
  readonly description: string | null;
  readonly domain: BudgetDomain;
};

export type SimpleSubAccount = types.TypedApiModel<"subaccount"> & {
  readonly identifier: string | null;
  readonly description: string | null;
  readonly domain: BudgetDomain;
};

export type Account = LineMetrics &
  SimpleAccount & {
    readonly order: string;
    readonly children: number[];
    // Only included for detail endpoints.
    readonly table?: SimpleAccount[];
    // Only included for detail endpoints.
    readonly ancestors?: [SimpleBudget | SimpleTemplate];
  };

export interface PdfAccount extends types.RowTypedApiModel<"pdf-account">, LineMetrics {
  readonly identifier: string | null;
  readonly description: string | null;
  readonly domain: BudgetDomain;
  readonly children: PdfSubAccount[];
  readonly groups: Group[];
  readonly children_markups: Markup[];
}

export type SubAccountUnit = tagging.Tag<typeof types.ApiModelTagTypes.SUBACCOUNT_UNIT>;

export type SubAccountMixin = LineMetrics & {
  readonly order: string;
  readonly fringe_contribution: number;
  readonly quantity: number | null;
  readonly rate: number | null;
  readonly multiplier: number | null;
  readonly unit: SubAccountUnit | null;
  // Only applicable for non-Template cases.
  readonly contact?: number | null;
};

export type SubAccount = SimpleSubAccount &
  SubAccountMixin & {
    readonly children: number[];
    readonly object_id: number;
    readonly parent_type: "account" | "subaccount";
    readonly fringes: number[];
    // Only applicable for non-Template cases.
    readonly attachments?: attachment.SimpleAttachment[];
    // Only included for detail endpoints.
    readonly table?: SimpleSubAccount[];
    // Only included for detail endpoints.
    readonly ancestors?: [
      SimpleBudget | SimpleTemplate,
      Omit<SimpleAccount, "order">,
      ...Array<Omit<SimpleSubAccount, "order">>,
    ];
  };

export interface PdfSubAccount extends types.RowTypedApiModel<"pdf-subaccount">, SubAccountMixin {
  readonly domain: BudgetDomain;
  readonly identifier: string | null;
  readonly description: string | null;
  readonly children: PdfSubAccount[];
  readonly groups: Group[];
  readonly children_markups: Markup[];
}

export type Ancestor =
  | SimpleBudget
  | SimpleTemplate
  | Omit<SimpleAccount, "order">
  | Omit<SimpleSubAccount, "order">;

export type ActualOwner = SimpleMarkup | Omit<SimpleSubAccount, "order" | "domain">;

export type TaggedActual = types.TypedApiModel<"actual"> & {
  readonly name: string | null;
  readonly date: string | null;
  readonly value: number | null;
  readonly owner: ActualOwner | null;
  readonly budget: SimpleBudget;
};

export type ActualType = tagging.Tag<typeof types.ApiModelTagTypes.ACTUAL_TYPE>;

export type Actual = types.RowTypedApiModel<"actual"> & {
  readonly contact: number | null;
  readonly name: string | null;
  readonly notes: string | null;
  readonly purchase_order: string | null;
  readonly date: string | null;
  readonly payment_id: string | null;
  readonly value: number | null;
  readonly actual_type: ActualType | null;
  readonly attachments: attachment.SimpleAttachment[];
  readonly owner: ActualOwner | null;
};

export type SimpleHeaderTemplate = types.ApiModel & {
  readonly name: string;
};

export type HeaderTemplate = SimpleHeaderTemplate & {
  readonly header: string | null;
  readonly left_image: fs.SavedImage | null;
  readonly left_info: string | null;
  readonly right_image: fs.SavedImage | null;
  readonly right_info: string | null;
};
