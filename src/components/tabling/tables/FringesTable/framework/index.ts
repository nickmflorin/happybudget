import React from "react";

import * as cells from "./cells";
import * as editors from "./editors";

const FrameworkComponents: Table.Framework = {
  editors: {
    FringesColorEditor: editors.FringesColorEditor,
    FringeUnitEditor: editors.FringeUnitEditor
  },
  cells: {
    data: {
      FringeUnitCell: React.memo(cells.FringeUnitCell)
    }
  }
};

export default FrameworkComponents;
