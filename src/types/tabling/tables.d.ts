/// <reference path="../tabling/table.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Tables {
  interface BudgetRowData extends Model.LineMetrics, Pick<Model.Line, "identifier" | "description"> {}

  interface AccountRowData extends BudgetRowData {}

  type AccountRow = Table.BodyRow<AccountRowData>;
  type AccountTableStore = Redux.BudgetTableStore<AccountRowData, Model.Account>;

  interface SubAccountRowData
    extends BudgetRowData,
      Pick<Model.SubAccount, "quantity" | "unit" | "multiplier" | "rate" | "fringes" | "fringe_contribution"> {
    readonly contact?: number | null;
  }

  type SubAccountRow = Table.BodyRow<SubAccountRowData>;
  type SubAccountTableStore = Redux.BudgetTableStore<SubAccountRowData, Model.SubAccount> & {
    readonly fringes: FringeTableStore;
    readonly subaccountUnits: Model.Tag[];
  };

  type FringeRowData = Pick<Model.Fringe, "color" | "name" | "description" | "cutoff" | "rate" | "unit">;
  type FringeRow = Table.BodyRow<FringeRowData>;
  type FringeTableStore = Redux.TableStore<FringeRowData, Model.Fringe> & {
    readonly fringeColors: string[];
  };

  type ActualRowData = Pick<
    Model.Actual,
    "description" | "purchase_order" | "date" | "payment_method" | "payment_id" | "value" | "contact" | "subaccount"
  >;

  type ActualRow = Table.BodyRow<ActualRowData>;
  type ActualTableStore = Redux.TableStore<ActualRowData, Model.Actual> & {
    readonly subAccountsTree: Redux.ModelListResponseStore<Model.SubAccountTreeNode>;
  };

  type PdfSubAccountRowData = {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly quantity: number | null;
    readonly unit: Model.Tag | null;
    readonly multiplier: number | null;
    readonly rate: number | null;
    readonly estimated: number | null;
    readonly contact: number | null;
  };
  type PdfSubAccountRow = Table.BodyRow<PdfSubAccountRowData>;

  type PdfAccountRowData = {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly estimated: number | null;
    readonly variance: number | null;
    readonly actual: number | null;
  };
  type PdfAccountRow = Table.BodyRow<PdfAccountRowData>;

  type ContactRowData = Pick<Model.Contact, "contact_type" | "company" | "position" | "phone_number" | "email"> & {
    readonly names_and_image: Model.ContactNamesAndImage;
  };

  type ContactRow = Table.BodyRow<ContactRowData>;
  type ContactTableStore = Redux.TableStore<ContactRowData, Model.Contact>;
}
