import React, { useState } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { TemplateSubAccountRowManager } from "lib/tabling/managers";

import { selectTemplateFringes, selectTemplateDetail, selectTemplateDetailLoading } from "../../store/selectors";
import { GenericSubAccountsTable, GenericSubAccountsTableProps } from "../Generic";
import FringesModal from "./FringesModal";

interface TemplateSubAccountsTableProps
  extends Omit<
    GenericSubAccountsTableProps<Table.TemplateSubAccountRow, Model.TemplateSubAccount, Model.TemplateGroup>,
    | "manager"
    | "fringes"
    | "fringesCellRenderer"
    | "fringesCellEditor"
    | "fringesCellEditorParams"
    | "onEditFringes"
    | "columns"
  > {
  detail: Model.TemplateAccount | Model.TemplateSubAccount | undefined;
}

const TemplateSubAccountsTable = ({ detail, ...props }: TemplateSubAccountsTableProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const templateDetail = useSelector(selectTemplateDetail);
  const loadingTemplate = useSelector(selectTemplateDetailLoading);
  const fringes = useSelector(selectTemplateFringes);

  return (
    <React.Fragment>
      <GenericSubAccountsTable<Table.TemplateSubAccountRow, Model.TemplateSubAccount, Model.TemplateGroup>
        manager={TemplateSubAccountRowManager}
        loadingBudget={loadingTemplate}
        fringes={fringes}
        fringesCellEditor={"TemplateFringesCellEditor"}
        fringesCellRenderer={"TemplateFringesCell"}
        fringesCellEditorParams={{
          onAddFringes: () => setFringesModalVisible(true),
          onRowUpdate: (change: Table.RowChange<Table.TemplateSubAccountRow>) => props.onRowUpdate(change),
          colId: "fringes"
        }}
        onEditFringes={() => setFringesModalVisible(true)}
        columns={[
          {
            field: "estimated",
            headerName: "Estimated",
            isCalculated: true,
            tableTotal: !isNil(detail) && !isNil(detail.estimated) ? detail.estimated : 0.0,
            budgetTotal: !isNil(templateDetail) && !isNil(templateDetail.estimated) ? templateDetail.estimated : 0.0
          }
        ]}
        {...props}
      />
      <FringesModal open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default TemplateSubAccountsTable;
