import { withExcludeGroupRows } from "components/tabling/tables/BudgetTable/framework/cells";
import * as cells from "./cells";
import * as editors from "./editors";

export const Framework: Table.Framework = {
  editors: {
    FringesEditor: editors.FringesEditor,
    SubAccountUnitEditor: editors.SubAccountUnitEditor
  },
  cells: {
    data: {
      SubAccountUnitCell: withExcludeGroupRows(cells.SubAccountUnitCell),
      FringesCell: withExcludeGroupRows(cells.FringesCell)
    }
  }
};
