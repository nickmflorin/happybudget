declare namespace Tables {
  type BudgetRowData = Model.LineMetrics & {
    readonly identifier: string | null;
    readonly description: string | null;
  };

  type AccountRowData = BudgetRowData;
  type AccountRow = Table.ModelRow<AccountRowData>;
  type AccountTableStore = Redux.BudgetTableStore<AccountRowData>;

  type SubAccountRowData = BudgetRowData &
    Pick<
      Model.SubAccount,
      "quantity" | "unit" | "multiplier" | "rate" | "fringes" | "fringe_contribution" | "attachments" | "contact"
    >;
  type SubAccountRow = Table.ModelRow<SubAccountRowData>;
  type SubAccountTableStore = Redux.BudgetTableStore<SubAccountRowData>;

  type FringeRowData = Pick<Model.Fringe, "color" | "name" | "description" | "cutoff" | "rate" | "unit">;
  type FringeRow = Table.ModelRow<FringeRowData>;
  type FringeTableStore = Redux.TableStore<FringeRowData>;

  type ActualRowData = Pick<
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
  type ActualRow = Table.ModelRow<ActualRowData>;
  type ActualTableStore = Redux.TableStore<ActualRowData> & {
    readonly owners: Redux.AuthenticatedModelListStore<Model.ActualOwner>;
  };

  type ContactRowData = Pick<
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

  type ContactRow = Table.ModelRow<ContactRowData>;
  type ContactTableStore = Redux.TableStore<ContactRowData>;
}

declare namespace PdfBudgetTable {
  // Either the TopSheet page or an ID of the account.
  type TableOption = "topsheet" | number;

  type HeaderOptions = {
    readonly header: Pdf.HTMLNode[];
    readonly left_image: UploadedImage | SavedImage | null;
    readonly left_info: Pdf.HTMLNode[] | null;
    readonly right_image: UploadedImage | SavedImage | null;
    readonly right_info: Pdf.HTMLNode[] | null;
  };

  type Options = {
    readonly date: string;
    readonly header: HeaderOptions;
    readonly columns: string[];
    readonly tables?: TableOption[] | null | undefined;
    readonly excludeZeroTotals: boolean;
    readonly notes?: Pdf.HTMLNode[];
    readonly includeNotes: boolean;
  };
}

declare namespace PdfActualsTable {
  type Options = {
    readonly date: string;
    readonly header: Pdf.HTMLNode[];
    readonly columns: string[];
    readonly excludeZeroTotals: boolean;
  };
}
