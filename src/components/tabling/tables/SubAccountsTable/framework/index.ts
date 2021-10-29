import React from "react";

import { framework } from "components/tabling/generic";

import * as cells from "./cells";
import * as editors from "./editors";

export const Framework: Table.Framework = {
  editors: {
    FringesEditor: editors.FringesEditor,
    SubAccountUnitEditor: editors.SubAccountUnitEditor
  },
  cells: {
    data: {
      SubAccountUnitCell: framework.excludeRowsOfType(["group"])(React.memo(cells.SubAccountUnitCell)),
      FringesCell: framework.excludeRowsOfType(["group"])(React.memo(cells.FringesCell))
    }
  }
};
