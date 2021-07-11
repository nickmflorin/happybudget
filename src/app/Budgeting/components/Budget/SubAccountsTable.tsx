import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { selectBudgetDetail, selectBudgetDetailLoading } from "../../store/selectors";
import { GenericSubAccountsTable, GenericSubAccountsTableProps } from "../Generic";

interface SubAccountsTableProps extends Omit<GenericSubAccountsTableProps, "manager" | "columns"> {
  detail: Model.Account | Model.SubAccount | undefined;
  loadingParent: boolean;
}

const SubAccountsTable = ({ loadingParent, detail, ...props }: SubAccountsTableProps): JSX.Element => {
  const budgetDetail = useSelector(selectBudgetDetail);
  const loadingBudget = useSelector(selectBudgetDetailLoading);

  return (
    <GenericSubAccountsTable
      loadingBudget={loadingBudget}
      loadingParent={loadingParent}
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
  );
};

export default SubAccountsTable;
