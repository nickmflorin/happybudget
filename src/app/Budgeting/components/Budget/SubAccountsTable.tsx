import React, { useState } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import * as models from "lib/model";

import { selectBudgetFringes, selectBudgetDetail, selectBudgetDetailLoading } from "../../store/selectors";
import { GenericSubAccountsTable, GenericSubAccountsTableProps } from "../Generic";
import FringesModal from "./FringesModal";

interface BudgetSubAccountsTableProps
  extends Omit<
    GenericSubAccountsTableProps<BudgetTable.BudgetSubAccountRow, Model.BudgetSubAccount, Model.BudgetGroup>,
    | "manager"
    | "fringes"
    | "fringesCellRenderer"
    | "fringesCellEditor"
    | "fringesCellEditorParams"
    | "onEditFringes"
    | "columns"
  > {
  detail: Model.BudgetAccount | Model.BudgetSubAccount | undefined;
  loadingParent: boolean;
}

const BudgetSubAccountsTable = ({ loadingParent, detail, ...props }: BudgetSubAccountsTableProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);

  const budgetDetail = useSelector(selectBudgetDetail);
  const loadingBudget = useSelector(selectBudgetDetailLoading);
  const fringes = useSelector(selectBudgetFringes);

  return (
    <React.Fragment>
      <GenericSubAccountsTable<BudgetTable.BudgetSubAccountRow, Model.BudgetSubAccount, Model.BudgetGroup>
        manager={models.BudgetSubAccountRowManager}
        loadingBudget={loadingBudget}
        loadingParent={loadingParent}
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
            type: "sum",
            budget: {
              value: !isNil(budgetDetail) && !isNil(budgetDetail.estimated) ? budgetDetail.estimated : 0.0
            },
            footer: {
              value: !isNil(detail) && !isNil(detail.estimated) ? detail.estimated : 0.0
            }
          },
          {
            field: "actual",
            headerName: "Actual",
            isCalculated: true,
            type: "sum",
            budget: {
              value: !isNil(budgetDetail) && !isNil(budgetDetail.actual) ? budgetDetail.actual : 0.0
            },
            footer: {
              value: !isNil(detail) && !isNil(detail.actual) ? detail.actual : 0.0
            }
          },
          {
            field: "variance",
            headerName: "Variance",
            isCalculated: true,
            type: "sum",
            budget: {
              value: !isNil(budgetDetail) && !isNil(budgetDetail.variance) ? budgetDetail.variance : 0.0
            },
            footer: {
              value: !isNil(detail) && !isNil(detail.variance) ? detail.variance : 0.0
            }
          }
        ]}
        {...props}
      />
      <FringesModal open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default BudgetSubAccountsTable;
