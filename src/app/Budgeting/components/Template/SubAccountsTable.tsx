import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";

import { TemplateSubAccountRowManager } from "lib/tabling/managers";

import {
  selectTemplateFringes,
  selectTemplateDetail,
  selectTemplateDetailLoading,
  selectTemplateId
} from "../../store/selectors";
import { GenericSubAccountsTable, GenericSubAccountsTableProps } from "../Generic";
import FringesModal from "./FringesModal";

const TemplateSubAccountsTable = ({
  ...props
}: Omit<
  GenericSubAccountsTableProps<Table.TemplateSubAccountRow, Model.TemplateSubAccount, Model.TemplateGroup>,
  "manager" | "fringes" | "fringesCellRenderer" | "fringesCellRendererParams" | "onEditFringes"
>): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);

  const history = useHistory();
  const detail = useSelector(selectTemplateDetail);
  const loadingTemplate = useSelector(selectTemplateDetailLoading);
  const fringes = useSelector(selectTemplateFringes);
  const templateId = useSelector(selectTemplateId);

  return (
    <React.Fragment>
      <GenericSubAccountsTable<Table.TemplateSubAccountRow, Model.TemplateSubAccount, Model.TemplateGroup>
        manager={TemplateSubAccountRowManager}
        loadingBudget={loadingTemplate}
        fringes={fringes}
        fringesCellRenderer={"TemplateFringesCell"}
        fringesCellRendererParams={{
          onAddFringes: () => history.push(`/templates/${templateId}/fringes`)
        }}
        onEditFringes={() => setFringesModalVisible(true)}
        budgetTotals={{
          estimated: !isNil(detail) && !isNil(detail.estimated) ? detail.estimated : 0.0
        }}
        calculatedColumns={[
          {
            field: "estimated",
            headerName: "Estimated"
          }
        ]}
        {...props}
      />
      <FringesModal open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default TemplateSubAccountsTable;
