import * as cells from "./cells";

const FrameworkComponents: Table.Framework = {
  editors: {},
  cells: {
    data: {
      ExpandCell: cells.withExcludeGroupRows(cells.ExpandCell),
      IdentifierCell: cells.IdentifierCell
    },
    footer: { IdentifierCell: cells.IdentifierCell },
    page: { BudgetFooterCalculatedCell: cells.BudgetFooterCalculatedCell, IdentifierCell: cells.IdentifierCell }
  }
};

export default FrameworkComponents;
