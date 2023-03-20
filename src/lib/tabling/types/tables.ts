import * as rows from "./rows";

type BudgetRowData = Model.LineMetrics & {
  readonly identifier: string | null;
  readonly description: string | null;
};

export type AccountRowData = BudgetRowData;
export type AccountRow = rows.Row<AccountRowData>;
export type AccountTableStore = Redux.BudgetTableStore<AccountRowData>;

export type SubAccountRowData = BudgetRowData &
  Pick<
    Model.SubAccount,
    | "quantity"
    | "unit"
    | "multiplier"
    | "rate"
    | "fringes"
    | "fringe_contribution"
    | "attachments"
    | "contact"
  >;
export type SubAccountRow = rows.Row<SubAccountRowData>;
export type SubAccountTableStore = Redux.BudgetTableStore<SubAccountRowData>;

export type FringeRowData = Pick<
  Model.Fringe,
  "color" | "name" | "description" | "cutoff" | "rate" | "unit"
>;
export type FringeRow = rows.Row<FringeRowData>;
export type FringeTableStore = Redux.TableStore<FringeRowData>;

export type ActualRowData = Pick<
  Model.Actual,
  | "name"
  | "notes"
  | "purchase_order"
  | "date"
  | "actual_type"
  | "payment_id"
  | "value"
  | "contact"
  | "owner"
  | "attachments"
>;
export type ActualRow = rows.Row<ActualRowData>;
export type ActualTableStore = Redux.TableStore<ActualRowData> & {
  readonly owners: Redux.AuthenticatedModelListStore<Model.ActualOwner>;
};

export type ContactRowData = Pick<
  Model.Contact,
  | "contact_type"
  | "company"
  | "position"
  | "rate"
  | "phone_number"
  | "email"
  | "first_name"
  | "last_name"
  | "image"
  | "attachments"
>;

export type ContactRow = rows.Row<ContactRowData>;
export type ContactTableStore = Redux.TableStore<ContactRowData>;

// Either the TopSheet page or an ID of the account.
export type PdfBudgetTableOption = "topsheet" | number;

export type PdfBudgetTableHeaderOptions = {
  readonly header: Pdf.HTMLNode[];
  readonly left_image: UploadedImage | SavedImage | null;
  readonly left_info: Pdf.HTMLNode[] | null;
  readonly right_image: UploadedImage | SavedImage | null;
  readonly right_info: Pdf.HTMLNode[] | null;
};

export type PdfBudgetTableOptions = {
  readonly date: string;
  readonly header: PdfBudgetTableHeaderOptions;
  readonly columns: string[];
  readonly tables?: PdfBudgetTableOption[] | null | undefined;
  readonly excludeZeroTotals: boolean;
  readonly notes?: Pdf.HTMLNode[];
  readonly includeNotes: boolean;
};

export type PdfActualsTableOptions = {
  readonly date: string;
  readonly header: Pdf.HTMLNode[];
  readonly columns: string[];
  readonly excludeZeroTotals: boolean;
};
