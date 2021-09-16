import { framework } from "components/tabling/generic";

import * as cells from "./cells";
export * as columnObjs from "./columnObjs";

export const Framework: Table.Framework = {
  editors: {},
  cells: {
    data: {
      ExpandCell: framework.excludeRowsOfType(["placeholder", "group"])(
        framework.renderOnRowType<any>({ default: cells.ExpandCell, markup: framework.cells.EditCell })
      ),
      IdentifierCell: cells.IdentifierCell
    },
    footer: { IdentifierCell: cells.IdentifierCell },
    page: { IdentifierCell: cells.IdentifierCell }
  }
};
