declare namespace Tables {
  type BudgetRowData = Model.LineMetrics & {
    readonly identifier: string | null;
    readonly description: string | null;
  };

  type AccountRowData = BudgetRowData;

  type AccountRow = Table.ModelRow<AccountRowData>;
  type AccountTableContext = { readonly budgetId: number };
  type AccountTableStore = Redux.BudgetTableStore<AccountRowData>;

  type SubAccountRowData = BudgetRowData &
    Pick<
      Model.SubAccount,
      "quantity" | "unit" | "multiplier" | "rate" | "fringes" | "fringe_contribution" | "attachments"
    > & {
      readonly contact?: number | null;
    };

  type SubAccountRow = Table.ModelRow<SubAccountRowData>;
  type SubAccountTableContext = { readonly id: number; readonly budgetId: number };
  type SubAccountTableStore = Redux.BudgetTableStore<SubAccountRowData> & {
    readonly fringes: FringeTableStore;
    readonly subaccountUnits: Model.Tag[];
  };

  type FringeRowData = Pick<Model.Fringe, "color" | "name" | "description" | "cutoff" | "rate" | "unit">;
  type FringeTableContext = { readonly id: number; readonly budgetId: number };
  type FringeRow = Table.ModelRow<FringeRowData>;
  type FringeTableStore = Redux.TableStore<FringeRowData> & {
    readonly fringeColors: string[];
  };

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
  type ActualTableContext = { readonly budgetId: number };
  type ActualTableStore = Redux.TableStore<ActualRowData> & {
    readonly owners: Redux.AuthenticatedModelListResponseStore<Model.ActualOwner>;
    readonly types: Model.Tag[];
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
  type ContactTableContext = Table.Context;
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
    readonly header: HeaderOptions;
    readonly columns: string[];
    readonly tables?: TableOption[] | null | undefined;
    readonly excludeZeroTotals: boolean;
    readonly notes?: Pdf.HTMLNode[];
    readonly includeNotes: boolean;
  };
}
