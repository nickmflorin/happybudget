import { framework } from "components/tabling/generic";

import * as cells from "./cells";

export const Framework: Table.Framework = {
  editors: {},
  cells: {
    data: {
      ExpandCell: framework.excludeRowsOfType(["placeholder"])(cells.ExpandCell)
    },
    footer: { IdentifierCell: cells.IdentifierCell },
    page: { IdentifierCell: cells.IdentifierCell }
  }
};
