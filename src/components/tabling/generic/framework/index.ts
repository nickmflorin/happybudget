import * as cells from "./cells";
import * as editors from "./editors";

export * as editors from "./editors";
export * as cells from "./cells";
export * as columnObjs from "./columnObjs";
export * as actions from "./actions";

const FrameworkComponents: Table.Framework = {
  editors: {
    ContactEditor: editors.ContactEditor
  },
  cells: {
    data: {
      ExpandCell: cells.ExpandCell,
      EmptyCell: cells.EmptyCell,
      NewRowCell: cells.NewRowCell,
      BodyCell: cells.BodyCell,
      CalculatedCell: cells.CalculatedCell,
      ColorCell: cells.ColorCell,
      ContactCell: cells.ContactCell,
      agColumnHeader: cells.HeaderCell
    },
    footer: {
      CalculatedCell: cells.CalculatedCell,
      BodyCell: cells.BodyCell,
      EmptyCell: cells.EmptyCell,
      NewRowCell: cells.NewRowCell
    },
    page: { CalculatedCell: cells.CalculatedCell, BodyCell: cells.BodyCell, EmptyCell: cells.EmptyCell }
  }
};

export default FrameworkComponents;
