import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { selectTemplateDetail, selectTemplateDetailLoading } from "../../store/selectors";
import { GenericSubAccountsTable, GenericSubAccountsTableProps } from "../Generic";
import FringesModal from "./SubAccount/FringesModal";

interface SubAccountsTableProps
  extends Omit<GenericSubAccountsTableProps, "manager" | "columns" | "budgetType" | "tableRef"> {
  detail: Model.Account | Model.SubAccount | undefined;
}

const SubAccountsTable = ({ detail, ...props }: SubAccountsTableProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const templateDetail = useSelector(selectTemplateDetail);
  const loadingTemplate = useSelector(selectTemplateDetailLoading);
  const tableRef = useRef<BudgetTable.Ref<BudgetTable.SubAccountRow, Model.SubAccount>>(null);

  return (
    <React.Fragment>
      <GenericSubAccountsTable
        tableRef={tableRef}
        budgetType={"template"}
        loadingBudget={loadingTemplate}
        columns={[
          {
            field: "estimated",
            headerName: "Estimated",
            isCalculated: true,
            columnType: "sum",
            fieldBehavior: ["read"],
            budget: {
              value: !isNil(templateDetail) && !isNil(templateDetail.estimated) ? templateDetail.estimated : 0.0
            },
            footer: {
              value: !isNil(detail) && !isNil(detail.estimated) ? detail.estimated : 0.0
            }
          }
        ]}
        {...props}
      />
      <FringesModal open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default SubAccountsTable;
