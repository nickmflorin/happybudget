import React from "react";

import PublicTable, { PublicTableProps } from "./PublicTable";
import Columns from "./Columns";

export type PublicBudgetProps = Omit<PublicTableProps<Model.Budget>, "domain" | "columns">;

const PublicBudgetTable = (props: PublicBudgetProps): JSX.Element => (
  <PublicTable {...props} domain={"budget"} columns={Columns} />
);

export default React.memo(PublicBudgetTable);
