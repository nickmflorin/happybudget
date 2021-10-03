import * as cells from "./cells";
import * as editors from "./editors";

const FrameworkComponents: Table.Framework = {
  editors: {
    PaymentMethodEditor: editors.PaymentMethodEditor,
    OwnerTreeEditor: editors.OwnerTreeEditor
  },
  cells: {
    data: {
      PaymentMethodCell: cells.PaymentMethodCell,
      OwnerCell: cells.OwnerCell
    }
  }
};

export default FrameworkComponents;
