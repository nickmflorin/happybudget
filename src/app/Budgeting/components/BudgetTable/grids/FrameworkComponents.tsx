import * as cells from "../cells";
import { withCellPreparations, withPrimaryGrid } from "../cells";
import * as editors from "../editors";

export const Cells = {
  ExpandCell: withCellPreparations(cells.ExpandCell),
  IndexCell: withCellPreparations(cells.IndexCell),
  BodyCell: withCellPreparations(cells.BodyCell),
  SubAccountUnitCell: withPrimaryGrid(withCellPreparations(cells.SubAccountUnitCell)),
  FringeUnitCell: withPrimaryGrid(withCellPreparations(cells.FringeUnitCell)),
  IdentifierCell: withCellPreparations(cells.IdentifierCell),
  CalculatedCell: withCellPreparations(cells.CalculatedCell),
  PaymentMethodCell: withPrimaryGrid(withCellPreparations(cells.PaymentMethodCell)),
  BudgetItemCell: withCellPreparations(cells.BudgetItemCell),
  FringesCell: withPrimaryGrid(withCellPreparations(cells.FringesCell)),
  ColorCell: withPrimaryGrid(withCellPreparations(cells.ColorCell)),
  ContactCell: withPrimaryGrid(withCellPreparations(cells.ContactCell)),
  BudgetFooterCalculatedCell: withCellPreparations(cells.BudgetFooterCalculatedCell)
};

export const Editors = {
  FringesColorEditor: editors.FringesColorEditor,
  FringeUnitCellEditor: editors.FringeUnitCellEditor,
  FringesCellEditor: editors.FringesCellEditor,
  SubAccountUnitCellEditor: editors.SubAccountUnitCellEditor,
  PaymentMethodCellEditor: editors.PaymentMethodCellEditor,
  SubAccountsTreeEditor: editors.SubAccountsTreeEditor,
  ContactCellEditor: editors.ContactCellEditor
};

const FrameworkComponents = {
  ...Editors,
  ...Cells,
  agColumnHeader: cells.HeaderCell
};

export default FrameworkComponents;
