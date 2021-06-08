import * as cells from "../cells";
import { withCellPreparations } from "../cells";
import * as editors from "../editors";

export const Cells = {
  ExpandCell: withCellPreparations(cells.ExpandCell),
  IndexCell: withCellPreparations(cells.IndexCell),
  BodyCell: withCellPreparations(cells.BodyCell),
  SubAccountUnitCell: withCellPreparations(cells.SubAccountUnitCell),
  FringeUnitCell: withCellPreparations(cells.FringeUnitCell),
  IdentifierCell: withCellPreparations(cells.IdentifierCell),
  CalculatedCell: withCellPreparations(cells.CalculatedCell),
  PaymentMethodCell: withCellPreparations(cells.PaymentMethodCell),
  BudgetItemCell: withCellPreparations(cells.BudgetItemCell),
  BudgetFringesCell: withCellPreparations(cells.BudgetFringesCell),
  TemplateFringesCell: withCellPreparations(cells.TemplateFringesCell),
  ColorCell: withCellPreparations(cells.ColorCell)
};

export const Editors = {
  FringesColorEditor: editors.FringesColorEditor,
  FringeUnitCellEditor: editors.FringeUnitCellEditor,
  BudgetFringesCellEditor: editors.BudgetFringesCellEditor,
  TemplateFringesCellEditor: editors.TemplateFringesCellEditor,
  SubAccountUnitCellEditor: editors.SubAccountUnitCellEditor,
  PaymentMethodCellEditor: editors.PaymentMethodCellEditor,
  BudgetItemsTreeEditor: editors.BudgetItemsTreeEditor
};

const FrameworkComponents = {
  ...Editors,
  ...Cells,
  agColumnHeader: cells.HeaderCell
};

export default FrameworkComponents;
