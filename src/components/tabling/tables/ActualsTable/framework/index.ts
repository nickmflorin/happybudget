import React from "react";

import * as cells from "./cells";
import * as editors from "./editors";

const FrameworkComponents: Table.Framework = {
  editors: {
    ActualTypeEditor: editors.ActualTypeEditor,
    OwnerTreeEditor: editors.OwnerTreeEditor
  },
  cells: {
    data: {
      ActualTypeCell: React.memo(cells.ActualTypeCell),
      OwnerCell: React.memo(cells.OwnerCell)
    }
  }
};

export default FrameworkComponents;
