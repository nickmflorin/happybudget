import React from "react";

import { framework } from "components/tabling/generic";

import * as cells from "./cells";

export const Framework: Table.Framework = {
  editors: {},
  cells: {
    data: {
      ExpandCell: framework.excludeRowsOfType(["placeholder"])(React.memo(cells.ExpandCell)),
      IdentifierCell: React.memo(cells.IdentifierCell)
    },
    footer: { IdentifierCell: React.memo(cells.IdentifierCell) },
    page: { IdentifierCell: React.memo(cells.IdentifierCell) }
  }
};
