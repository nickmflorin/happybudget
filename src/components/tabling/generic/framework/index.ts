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
    DateEditor: editors.DateEditor,
    NullCellEditor: editors.NullCellEditor
  },
  cells: {
    data: {
      EditCell: cells.excludeRowsOfType(["placeholder"])(cells.EditCell),
      EmptyCell: cells.EmptyCell,
      NewRowCell: cells.NewRowCell,
      BodyCell: cells.BodyCell,
      ColorCell: cells.ColorCell,
      ContactCell: cells.ContactCell,
      PhoneNumberCell: cells.PhoneNumberCell,
      EmailCell: cells.EmailCell,
      LinkCell: cells.LinkCell,
      AttachmentsCell: cells.AttachmentsCell,
      DragCell: cells.DragCell,
      agColumnHeader: cells.HeaderCell
    },
    footer: {
      CalculatedCell: cells.CalculatedCell,
      BodyCell: cells.BodyCell,
      EmptyCell: cells.EmptyCell,
      NewRowCell: cells.NewRowCell
    },
    page: {
      CalculatedCell: cells.CalculatedCell,
      BodyCell: cells.BodyCell,
      EmptyCell: cells.EmptyCell
    }
  }
};
