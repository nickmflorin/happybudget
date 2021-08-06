import * as cells from "./cells";
import * as editors from "./editors";

const FrameworkComponents: Table.Framework = {
  editors: {
    PaymentMethodEditor: editors.PaymentMethodEditor,
    SubAccountsTreeEditor: editors.SubAccountsTreeEditor
  },
  cells: {
    data: {
      PaymentMethodCell: cells.PaymentMethodCell,
      SubAccountCell: cells.SubAccountCell
    }
  }
};

export default FrameworkComponents;
