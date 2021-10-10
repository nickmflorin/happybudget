/// <reference path="../tabling/table.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Tables {
  interface BudgetRowData extends Model.LineMetrics, Pick<Model.Line, "identifier" | "description"> {}

  interface AccountRowData extends BudgetRowData {}

  type AccountRow = Table.ModelRow<AccountRowData>;
  type AccountTableStore = Redux.BudgetTableStore<AccountRowData>;

  interface SubAccountRowData
    extends BudgetRowData,
      Pick<Model.SubAccount, "quantity" | "unit" | "multiplier" | "rate" | "fringes" | "fringe_contribution"> {
    readonly contact?: number | null;
  }

  type SubAccountRow = Table.ModelRow<SubAccountRowData>;
  type SubAccountTableStore = Redux.BudgetTableStore<SubAccountRowData> & {
    readonly fringes: FringeTableStore;
    readonly subaccountUnits: Model.Tag[];
  };

  type FringeRowData = Pick<Model.Fringe, "color" | "name" | "description" | "cutoff" | "rate" | "unit">;
  type FringeRow = Table.ModelRow<FringeRowData>;
  type FringeTableStore = Redux.TableStore<FringeRowData> & {
    readonly fringeColors: string[];
  };

  type ActualRowData = Pick<
    Model.Actual,
    "description" | "purchase_order" | "date" | "payment_method" | "payment_id" | "value" | "contact" | "owner"
  >;

  type ActualRow = Table.ModelRow<ActualRowData>;
  type ActualTableStore = Redux.TableStore<ActualRowData> & {
    readonly ownerTree: Redux.ModelListResponseStore<Model.OwnerTreeNode>;
  };

  type ContactRowData = Pick<Model.Contact, "contact_type" | "company" | "position" | "rate" | "phone_number" | "email" | "first_name" | "last_name" | "image">;

  type ContactRow = Table.ModelRow<ContactRowData>;
  type ContactTableStore = Redux.TableStore<ContactRowData>;
}
