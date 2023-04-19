import { framework } from "deprecated/components/tabling/generic";

import * as cells from "./cells";

export const Framework: Table.Framework = {
  editors: {},
  cells: {
    data: {
      EditCell: framework.excludeRowsOfType(["placeholder"])(cells.EditCell),
    },
    footer: { IdentifierCell: cells.IdentifierCell },
    page: { IdentifierCell: cells.IdentifierCell },
  },
};
