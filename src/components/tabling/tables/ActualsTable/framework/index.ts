import * as cells from "./cells";
import * as editors from "./editors";

const FrameworkComponents: Table.Framework = {
  editors: {
    ActualTypeEditor: editors.ActualTypeEditor,
    OwnerTreeEditor: editors.OwnerTreeEditor
  },
  cells: {
    data: {
      ActualTypeCell: cells.ActualTypeCell,
      OwnerCell: cells.OwnerCell
    }
  }
};

export default FrameworkComponents;
