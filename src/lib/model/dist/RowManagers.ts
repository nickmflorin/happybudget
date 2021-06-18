import { isNil } from "lodash";
import { RowManager, ReadWrite, ReadOnly } from "lib/model/models";

export const BudgetAccountRowManager = new RowManager<
  BudgetTable.BudgetAccountRow,
  Model.BudgetAccount,
  Http.BudgetAccountPayload
>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
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
  BudgetTable.TemplateAccountRow,
  Model.TemplateAccount,
  Http.TemplateAccountPayload
>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
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
  BudgetTable.BudgetSubAccountRow,
  Model.BudgetSubAccount,
  Http.SubAccountPayload
>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
    ReadWrite({ field: "name", allowNull: true }),
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
    ReadWrite({ field: "fringes", allowNull: true })
  ],
  childrenGetter: (model: Model.SubAccount) => model.subaccounts,
  groupGetter: (model: Model.SubAccount) => model.group,
  labelGetter: (model: Model.SubAccount) => (!isNil(model.identifier) ? model.identifier : "Sub Account"),
  typeLabel: "Sub Account",
  rowType: "subaccount"
});

export const TemplateSubAccountRowManager = new RowManager<
  BudgetTable.TemplateSubAccountRow,
  Model.TemplateSubAccount,
  Http.SubAccountPayload
>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
    ReadWrite({ field: "name", allowNull: true }),
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
    ReadWrite({ field: "fringes", allowNull: true })
  ],
  childrenGetter: (model: Model.SubAccount) => model.subaccounts,
  groupGetter: (model: Model.SubAccount) => model.group,
  labelGetter: (model: Model.SubAccount) => (!isNil(model.identifier) ? model.identifier : "Sub Account"),
  typeLabel: "Sub Account",
  rowType: "subaccount"
});

export const ActualRowManager = new RowManager<BudgetTable.ActualRow, Model.Actual, Http.ActualPayload>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
    ReadWrite({
      field: "subaccount",
      allowNull: true,
      httpValueConverter: (value: Model.SimpleSubAccount | null) => {
        if (!isNil(value)) {
          return value.id;
        }
        return null;
      }
    }),
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
  labelGetter: (model: Model.Actual) => String(!isNil(model.subaccount) ? model.subaccount.identifier : ""),
  typeLabel: "Actual",
  rowType: "actual"
});

export const FringeRowManager = new RowManager<BudgetTable.FringeRow, Model.Fringe, Http.FringePayload>({
  fields: [
    ReadWrite({ field: "name" }),
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
