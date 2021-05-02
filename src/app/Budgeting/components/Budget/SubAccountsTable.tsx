import React, { useState } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { BudgetSubAccountRowManager } from "lib/tabling/managers";

import { selectBudgetFringes, selectBudgetDetail, selectBudgetDetailLoading } from "../../store/selectors";
import { GenericSubAccountsTable, GenericSubAccountsTableProps } from "../Generic";
import FringesModal from "./FringesModal";

const BudgetSubAccountsTable = ({
  ...props
}: Omit<
  GenericSubAccountsTableProps<Table.BudgetSubAccountRow, Model.BudgetSubAccount, Model.BudgetGroup>,
  "manager" | "fringes" | "fringesCellRenderer" | "fringesCellRendererParams" | "onEditFringes"
>): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);

  const detail = useSelector(selectBudgetDetail);
  const loadingBudget = useSelector(selectBudgetDetailLoading);
  const fringes = useSelector(selectBudgetFringes);

  return (
    <React.Fragment>
      <GenericSubAccountsTable<Table.BudgetSubAccountRow, Model.BudgetSubAccount, Model.BudgetGroup>
        manager={BudgetSubAccountRowManager}
        loadingBudget={loadingBudget}
        fringes={fringes}
        fringesCellRenderer={"BudgetFringesCell"}
        onEditFringes={() => setFringesModalVisible(true)}
        fringesCellRendererParams={{
          onAddFringes: () => setFringesModalVisible(true)
        }}
        budgetTotals={{
          estimated: !isNil(detail) && !isNil(detail.estimated) ? detail.estimated : 0.0,
          variance: !isNil(detail) && !isNil(detail.variance) ? detail.variance : 0.0,
          actual: !isNil(detail) && !isNil(detail.actual) ? detail.actual : 0.0
        }}
        calculatedColumns={[
          {
            field: "estimated",
            headerName: "Estimated"
          },
          {
            field: "actual",
            headerName: "Actual"
          },
          {
            field: "variance",
            headerName: "Variance"
          }
        ]}
        {...props}
      />
      <FringesModal open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default BudgetSubAccountsTable;
