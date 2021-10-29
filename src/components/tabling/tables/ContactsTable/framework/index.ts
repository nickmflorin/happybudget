import React from "react";

import * as cells from "./cells";
import * as editors from "./editors";

const FrameworkComponents: Table.Framework = {
  editors: {
    ContactTypeEditor: editors.ContactTypeEditor
  },
  cells: {
    data: {
      ContactTypeCell: React.memo(cells.ContactTypeCell),
      ContactNameCell: React.memo(cells.ContactNameCell)
    }
  }
};

export default FrameworkComponents;
