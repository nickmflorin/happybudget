import * as cells from "./cells";
import * as editors from "./editors";

const FrameworkComponents: Table.Framework = {
  editors: {
    ContactTypeEditor: editors.ContactTypeEditor
  },
  cells: {
    data: {
      ContactTypeCell: cells.ContactTypeCell
    }
  }
};

export default FrameworkComponents;
