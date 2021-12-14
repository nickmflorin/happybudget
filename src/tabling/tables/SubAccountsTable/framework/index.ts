import { framework } from "tabling/generic";

import * as cells from "./cells";
import * as editors from "./editors";

export const Framework: Table.Framework = {
  editors: {
    FringesEditor: editors.FringesEditor,
    SubAccountUnitEditor: editors.SubAccountUnitEditor
  },
  cells: {
    data: {
      SubAccountUnitCell: framework.excludeRowsOfType(["group"])(cells.SubAccountUnitCell),
      FringesCell: framework.excludeRowsOfType(["group"])(cells.FringesCell)
    }
  }
};
