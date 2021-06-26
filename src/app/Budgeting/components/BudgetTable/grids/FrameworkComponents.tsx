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
  BudgetFringesCell: withPrimaryGrid(withCellPreparations(cells.BudgetFringesCell)),
  TemplateFringesCell: withPrimaryGrid(withCellPreparations(cells.TemplateFringesCell)),
  ColorCell: withPrimaryGrid(withCellPreparations(cells.ColorCell))
};

export const Editors = {
  FringesColorEditor: editors.FringesColorEditor,
  FringeUnitCellEditor: editors.FringeUnitCellEditor,
  BudgetFringesCellEditor: editors.BudgetFringesCellEditor,
  TemplateFringesCellEditor: editors.TemplateFringesCellEditor,
  SubAccountUnitCellEditor: editors.SubAccountUnitCellEditor,
  PaymentMethodCellEditor: editors.PaymentMethodCellEditor,
  SubAccountsTreeEditor: editors.SubAccountsTreeEditor
};

const FrameworkComponents = {
  ...Editors,
  ...Cells,
  agColumnHeader: cells.HeaderCell
};

export default FrameworkComponents;
