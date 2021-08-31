import { framework } from "components/tabling/generic";

import * as cells from "./cells";
export * as columnObjs from "./columnObjs";

export const Framework: Table.Framework = {
  editors: {},
  cells: {
    data: {
      ExpandCell: framework.excludeRowsOfType(["placeholder", "group"])(cells.ExpandCell),
      IdentifierCell: cells.IdentifierCell
    },
    footer: { IdentifierCell: cells.IdentifierCell },
    page: { BudgetFooterCalculatedCell: cells.BudgetFooterCalculatedCell, IdentifierCell: cells.IdentifierCell }
  }
};
