/// <reference path="../tabling/table.d.ts" />

/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
namespace Tables {
  interface BudgetRowData extends Model.LineMetrics, Pick<Model.Line, "identifier" | "description"> {}

  interface AccountRowData extends BudgetRowData {}

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type AccountRow = Table.ModelRow<AccountRowData>;
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type AccountTableStore = Redux.BudgetTableStore<AccountRowData>;

  interface SubAccountRowData
    extends BudgetRowData,
      Pick<Model.SubAccount, "quantity" | "unit" | "multiplier" | "rate" | "fringes" | "fringe_contribution" | "attachments"> {
    readonly contact?: number | null;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type SubAccountRow = Table.ModelRow<SubAccountRowData>;
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type SubAccountTableStore = Redux.BudgetTableStore<SubAccountRowData> & {
    readonly fringes: FringeTableStore;
    readonly subaccountUnits: Model.Tag[];
  };

  type FringeRowData = Pick<Model.Fringe, "color" | "name" | "description" | "cutoff" | "rate" | "unit">;
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type FringeRow = Table.ModelRow<FringeRowData>;
  type FringeTableStore = Redux.TableStore<FringeRowData> & {
    readonly fringeColors: string[];
  };

  type ActualRowData = Pick<
    Model.Actual,
    "name" | "notes" | "purchase_order" | "date" | "actual_type" | "payment_id" | "value" | "contact" | "owner" | "attachments"
  >;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ActualRow = Table.ModelRow<ActualRowData>;
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ActualTableStore = Redux.TableStore<ActualRowData> & {
    readonly ownerTree: Redux.AuthenticatedModelListResponseStore<Model.OwnerTreeNode>;
    readonly actualTypes: Model.Tag[];
  };

  type ContactRowData = Pick<
    Model.Contact,
    "contact_type" | "company" | "position" | "rate" | "phone_number" | "email" | "first_name" | "last_name" | "image"
  >;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ContactRow = Table.ModelRow<ContactRowData>;
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ContactTableStore = Redux.TableStore<ContactRowData>;
}
