import React from "react";

import Columns from "./Columns";
import PublicTable, { PublicTableProps } from "./PublicTable";

export type PublicBudgetProps = Omit<PublicTableProps<Model.Budget>, "columns">;

const PublicBudgetTable = (props: PublicBudgetProps): JSX.Element => (
  <PublicTable {...props} columns={Columns} />
);

export default React.memo(PublicBudgetTable);
