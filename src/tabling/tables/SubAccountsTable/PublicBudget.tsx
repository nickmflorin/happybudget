import React from "react";

import PublicTable, { PublicTableProps } from "./PublicTable";
import Columns from "./Columns";

export type PublicBudgetProps<P extends Model.Account | Model.SubAccount> = Omit<
  PublicTableProps<Model.Budget, P>,
  "columns"
>;

const PublicBudgetTable = <P extends Model.Account | Model.SubAccount>(props: PublicBudgetProps<P>): JSX.Element => (
  <PublicTable {...props} columns={Columns} />
);

export default React.memo(PublicBudgetTable) as typeof PublicBudgetTable;
