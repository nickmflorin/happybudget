import React, { useState } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { BudgetSubAccountRowManager } from "lib/tabling/managers";

import { selectBudgetFringes, selectBudgetDetail, selectBudgetDetailLoading } from "../../store/selectors";
import { GenericSubAccountsTable, GenericSubAccountsTableProps } from "../Generic";
import FringesModal from "./FringesModal";

interface BudgetSubAccountsTableProps
  extends Omit<
    GenericSubAccountsTableProps<Table.BudgetSubAccountRow, Model.BudgetSubAccount, Model.BudgetGroup>,
    | "manager"
    | "fringes"
    | "fringesCellRenderer"
    | "fringesCellEditor"
    | "fringesCellEditorParams"
    | "onEditFringes"
    | "columns"
  > {
  detail: Model.BudgetAccount | Model.BudgetSubAccount | undefined;
}

const BudgetSubAccountsTable = ({ detail, ...props }: BudgetSubAccountsTableProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);

  const budgetDetail = useSelector(selectBudgetDetail);
  const loadingBudget = useSelector(selectBudgetDetailLoading);
  const fringes = useSelector(selectBudgetFringes);

  return (
    <React.Fragment>
      <GenericSubAccountsTable<Table.BudgetSubAccountRow, Model.BudgetSubAccount, Model.BudgetGroup>
        manager={BudgetSubAccountRowManager}
        loadingBudget={loadingBudget}
        fringes={fringes}
        fringesCellRenderer={"BudgetFringesCell"}
        fringesCellEditor={"BudgetFringesCellEditor"}
        onEditFringes={() => setFringesModalVisible(true)}
        fringesCellEditorParams={{
          onAddFringes: () => setFringesModalVisible(true),
          colId: "fringes"
        }}
        columns={[
          {
            field: "estimated",
            headerName: "Estimated",
            isCalculated: true,
            budgetTotal: !isNil(budgetDetail) && !isNil(budgetDetail.estimated) ? budgetDetail.estimated : 0.0,
            tableTotal: !isNil(detail) && !isNil(detail.estimated) ? detail.estimated : 0.0
          },
          {
            field: "actual",
            headerName: "Actual",
            isCalculated: true,
            budgetTotal: !isNil(budgetDetail) && !isNil(budgetDetail.actual) ? budgetDetail.actual : 0.0,
            tableTotal: !isNil(detail) && !isNil(detail.actual) ? detail.actual : 0.0
          },
          {
            field: "variance",
            headerName: "Variance",
            isCalculated: true,
            budgetTotal: !isNil(budgetDetail) && !isNil(budgetDetail.variance) ? budgetDetail.variance : 0.0,
            tableTotal: !isNil(detail) && !isNil(detail.variance) ? detail.variance : 0.0
          }
        ]}
        {...props}
      />
      <FringesModal open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default BudgetSubAccountsTable;
