import * as cells from "./cells";
import * as editors from "./editors";

const FrameworkComponents: Table.Framework = {
  editors: {
    FringesColorEditor: editors.FringesColorEditor,
    FringeUnitEditor: editors.FringeUnitEditor
  },
  cells: {
    data: {
      FringeUnitCell: cells.FringeUnitCell
    }
  }
};

export default FrameworkComponents;
