import { isNil } from "lodash";
import { RowManager, PdfRowManager, ReadWrite, ReadOnly } from "lib/model/models";

export const PdfAccountRowManager = new PdfRowManager<BudgetPdf.AccountRow, Model.PdfAccount>({
  fields: [
    ReadOnly({ field: "description" }),
    ReadOnly({ field: "identifier" }),
    ReadOnly({ field: "estimated" }),
    ReadOnly({ field: "variance" }),
    ReadOnly({ field: "actual" })
  ],
  groupGetter: (model: Model.PdfAccount) => model.group
});

export const AccountRowManager = new RowManager<BudgetTable.AccountRow, Model.Account, Http.AccountPayload>({
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

export const PdfSubAccountRowManager = new PdfRowManager<BudgetPdf.SubAccountRow, Model.PdfSubAccount>({
  fields: [
    ReadOnly({ field: "description" }),
    ReadOnly({ field: "identifier" }),
    ReadOnly({ field: "name" }),
    ReadOnly({ field: "quantity" }),
    ReadOnly({ field: "rate" }),
    ReadOnly({ field: "multiplier" }),
    ReadOnly({ field: "unit" }),
    ReadOnly({ field: "estimated" }),
    ReadOnly({ field: "variance" }),
    ReadOnly({ field: "actual" })
  ],
  groupGetter: (model: Model.PdfSubAccount) => model.group
});

export const SubAccountRowManager = new RowManager<BudgetTable.SubAccountRow, Model.SubAccount, Http.SubAccountPayload>(
  {
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
      ReadOnly({ field: "variance" }),
      ReadOnly({ field: "actual" }),
      ReadWrite({ field: "fringes", allowNull: true })
    ],
    childrenGetter: (model: Model.SubAccount) => model.subaccounts,
    groupGetter: (model: Model.SubAccount) => model.group,
    labelGetter: (model: Model.SubAccount) => (!isNil(model.identifier) ? model.identifier : "Sub Account"),
    typeLabel: "Sub Account",
    rowType: "subaccount"
  }
);

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
