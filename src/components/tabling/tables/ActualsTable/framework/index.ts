import * as cells from "./cells";
import * as editors from "./editors";

const FrameworkComponents: Table.Framework = {
  editors: {
    ActualTypeEditor: editors.ActualTypeEditor,
    ActualOwnerEditor: editors.ActualOwnerEditor
  },
  cells: {
    data: {
      ActualTypeCell: cells.ActualTypeCell,
      ActualOwnerCell: cells.ActualOwnerCell
    }
  }
};

export default FrameworkComponents;
