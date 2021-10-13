import * as cells from "./cells";
import * as editors from "./editors";

export * as editors from "./editors";
export * as cells from "./cells";
export * as actions from "./actions";
export { default as excludeRowsOfType } from "./cells/excludeRowsOfType";
export { default as renderOnRowType } from "./cells/renderOnRowType";
export { default as connectCellToStore } from "./cells/connectCellToStore";

export const Framework: Table.Framework = {
  editors: {
    ContactEditor: editors.ContactEditor,
    DateEditor: editors.DateEditor
  },
  cells: {
    data: {
      ExpandCell: cells.excludeRowsOfType(["placeholder"])(cells.ExpandCell),
      EmptyCell: cells.EmptyCell,
      NewRowCell: cells.NewRowCell,
      BodyCell: cells.BodyCell,
      CalculatedCell: cells.CalculatedCell,
      ColorCell: cells.ColorCell,
      ContactCell: cells.ContactCell,
      PhoneNumberCell: cells.PhoneNumberCell,
      EmailCell: cells.EmailCell,
      LinkCell: cells.LinkCell,
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
