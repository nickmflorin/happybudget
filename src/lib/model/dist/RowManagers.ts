import { isNil } from "lodash";
import { getKeyValue } from "lib/util";
import { RowManager, ReadWrite, ReadOnly, WriteOnly } from "lib/model/models";

export const BudgetAccountRowManager = new RowManager<
  Table.BudgetAccountRow,
  Model.BudgetAccount,
  Http.BudgetAccountPayload,
  Model.BudgetGroup
>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
    // We want to attribute the full group to the row, not just the ID.
    ReadWrite({ field: "group", allowNull: true, modelOnly: true }),
    ReadWrite({ field: "identifier", allowNull: true }),
    ReadOnly({ field: "estimated" }),
    ReadOnly({ field: "variance" }),
    ReadOnly({ field: "actual" })
  ],
  childrenGetter: (model: Model.Account) => model.subaccounts,
  groupGetter: (model: Model.Account) => model.group,
  labelGetter: (model: Model.Account) => (!isNil(model.identifier) ? model.identifier : "Account"),
  typeLabel: "Account",
  rowType: "account"
});

export const TemplateAccountRowManager = new RowManager<
  Table.TemplateAccountRow,
  Model.TemplateAccount,
  Http.TemplateAccountPayload,
  Model.TemplateGroup
>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
    // We want to attribute the full group to the row, not just the ID.
    ReadWrite({ field: "group", allowNull: true, modelOnly: true }),
    ReadWrite({ field: "identifier", allowNull: true }),
    ReadOnly({ field: "estimated" })
  ],
  childrenGetter: (model: Model.TemplateAccount) => model.subaccounts,
  groupGetter: (model: Model.TemplateAccount) => model.group,
  labelGetter: (model: Model.TemplateAccount) => (!isNil(model.identifier) ? model.identifier : "Account"),
  typeLabel: "Account",
  rowType: "account"
});

export const BudgetSubAccountRowManager = new RowManager<
  Table.BudgetSubAccountRow,
  Model.BudgetSubAccount,
  Http.SubAccountPayload,
  Model.BudgetGroup
>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
    ReadWrite({ field: "name", allowNull: true }),
    // We want to attribute the full group to the row, not just the ID.
    ReadWrite({ field: "group", allowNull: true, modelOnly: true }),
    ReadWrite({ field: "quantity", allowNull: true }),
    ReadWrite({ field: "rate", allowNull: true }),
    ReadWrite({ field: "multiplier", allowNull: true }),
    ReadWrite({
      field: "unit",
      allowNull: true,
      httpValueConverter: (unit: Model.Tag | null): number | null | undefined => {
        if (unit !== null) {
          return unit.id;
        }
        return null;
      }
    }),
    ReadWrite({ field: "identifier" }),
    ReadOnly({ field: "estimated" }),
    ReadOnly({ field: "variance" }),
    ReadOnly({ field: "actual" }),
    ReadWrite({ field: "fringes", allowNull: true, placeholderValue: [] })
  ],
  childrenGetter: (model: Model.SubAccount) => model.subaccounts,
  groupGetter: (model: Model.SubAccount) => model.group,
  labelGetter: (model: Model.SubAccount) => (!isNil(model.identifier) ? model.identifier : "Sub Account"),
  typeLabel: "Sub Account",
  rowType: "subaccount"
});

export const TemplateSubAccountRowManager = new RowManager<
  Table.TemplateSubAccountRow,
  Model.TemplateSubAccount,
  Http.SubAccountPayload,
  Model.TemplateGroup
>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
    ReadWrite({ field: "name", allowNull: true }),
    // We want to attribute the full group to the row, not just the ID.
    ReadWrite({ field: "group", allowNull: true, modelOnly: true }),
    ReadWrite({ field: "quantity", allowNull: true }),
    ReadWrite({ field: "rate", allowNull: true }),
    ReadWrite({ field: "multiplier", allowNull: true }),
    ReadWrite({
      field: "unit",
      allowNull: true,
      httpValueConverter: (unit: Model.Tag | null): number | null | undefined => {
        if (unit !== null) {
          return unit.id;
        }
        return null;
      }
    }),
    ReadWrite({ field: "identifier", allowNull: true }),
    ReadOnly({ field: "estimated" }),
    ReadWrite({ field: "fringes", allowNull: true, placeholderValue: [] })
  ],
  childrenGetter: (model: Model.SubAccount) => model.subaccounts,
  groupGetter: (model: Model.SubAccount) => model.group,
  labelGetter: (model: Model.SubAccount) => (!isNil(model.identifier) ? model.identifier : "Sub Account"),
  typeLabel: "Sub Account",
  rowType: "subaccount"
});

export const ActualRowManager = new RowManager<Table.ActualRow, Model.Actual, Http.ActualPayload, Model.Group>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
    // TODO: Eventually, we need to allow this to be null.
    WriteOnly({
      field: "object_id",
      http: ["PATCH"],
      required: true,
      getValueFromRow: (row: Table.ActualRow) => {
        if (!isNil(row.account)) {
          return row.account.id;
        }
        return null;
      },
      getValueFromRowChangeData: (data: Table.RowChangeData<Table.ActualRow>) => {
        const cellChange: Table.CellChange<Table.ActualRow[keyof Table.ActualRow]> | undefined = getKeyValue<
          { [key in keyof Table.ActualRow]?: Table.CellChange<Table.ActualRow[key]> },
          keyof Table.ActualRow
        >("account")(data);
        if (cellChange !== undefined) {
          const account: Model.SimpleAccount | Model.SimpleSubAccount | null = cellChange.newValue;
          if (account !== null) {
            return account.id;
          }
          return null;
        }
        return undefined;
      }
    }),
    // TODO: Eventually, we need to allow this to be null.
    WriteOnly({
      field: "parent_type",
      http: ["PATCH"],
      required: true,
      getValueFromRow: (row: Table.ActualRow) => {
        if (!isNil(row.account)) {
          return row.account.type;
        }
        return null;
      },
      getValueFromRowChangeData: (data: Table.RowChangeData<Table.ActualRow>) => {
        const cellChange: Table.CellChange<Table.ActualRow[keyof Table.ActualRow]> | undefined = getKeyValue<
          { [key in keyof Table.ActualRow]?: Table.CellChange<Table.ActualRow[key]> },
          keyof Table.ActualRow
        >("account")(data);
        if (cellChange !== undefined) {
          const account: Model.SimpleAccount | Model.SimpleSubAccount | null = cellChange.newValue;
          if (account !== null) {
            return account.type;
          }
          return null;
        }
        return undefined;
      }
    }),
    ReadOnly({ field: "account" }),
    ReadWrite({ field: "vendor", allowNull: true }),
    ReadWrite({ field: "purchase_order", allowNull: true }),
    ReadWrite({ field: "date", allowNull: true }),
    ReadWrite({
      field: "payment_method",
      allowNull: true,
      httpValueConverter: (payment_method: Model.PaymentMethod | null) => {
        if (payment_method !== null) {
          return payment_method.id;
        }
        return null;
      }
    }),
    ReadWrite({ field: "payment_id", allowNull: true }),
    ReadWrite({ field: "value", allowNull: true })
  ],
  labelGetter: (model: Model.Actual) => String(!isNil(model.account) ? model.account.identifier : ""),
  typeLabel: "Actual",
  rowType: "actual"
});

export const FringeRowManager = new RowManager<Table.FringeRow, Model.Fringe, Http.FringePayload, Model.Group>({
  fields: [
    ReadWrite({ field: "name", required: true }),
    ReadWrite({ field: "description", allowNull: true }),
    ReadWrite({ field: "cutoff", allowNull: true }),
    ReadWrite({ field: "rate", allowNull: true }),
    ReadWrite({ field: "color", allowNull: true }),
    ReadWrite({
      field: "unit",
      allowNull: false,
      httpValueConverter: (unit: Model.FringeUnit | null) => {
        if (unit !== null) {
          return unit.id;
        }
        return null;
      }
    })
  ],
  labelGetter: (model: Model.Fringe) => String(model.name),
  typeLabel: "Fringe",
  rowType: "fringe"
});

const RowManagers = {
  BudgetAccountRowManager,
  BudgetSubAccountRowManager,
  TemplateAccountRowManager,
  TemplateSubAccountRowManager,
  FringeRowManager,
  ActualRowManager
};

export default RowManagers;
