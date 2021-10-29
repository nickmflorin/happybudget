import React from "react";

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
      ExpandCell: React.memo(cells.excludeRowsOfType(["placeholder"])(cells.ExpandCell)),
      EmptyCell: React.memo(cells.EmptyCell),
      NewRowCell: React.memo(cells.NewRowCell),
      BodyCell: React.memo(cells.BodyCell),
      CalculatedCell: React.memo(cells.CalculatedCell),
      ColorCell: React.memo(cells.ColorCell),
      ContactCell: React.memo(cells.ContactCell),
      PhoneNumberCell: React.memo(cells.PhoneNumberCell),
      EmailCell: React.memo(cells.EmailCell),
      LinkCell: React.memo(cells.LinkCell),
      AttachmentsCell: React.memo(cells.AttachmentsCell),
      agColumnHeader: React.memo(cells.HeaderCell)
    },
    footer: {
      CalculatedCell: React.memo(cells.CalculatedCell),
      BodyCell: React.memo(cells.BodyCell),
      EmptyCell: React.memo(cells.EmptyCell),
      NewRowCell: React.memo(cells.NewRowCell)
    },
    page: {
      CalculatedCell: React.memo(cells.CalculatedCell),
      BodyCell: React.memo(cells.BodyCell),
      EmptyCell: React.memo(cells.EmptyCell)
    }
  }
};
