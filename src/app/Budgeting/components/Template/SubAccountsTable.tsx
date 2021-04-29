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
import SubAccountsBudgetTable, { SubAccountsBudgetTableProps } from "../SubAccountsBudgetTable";

const SubAccountsTable = ({
  ...props
}: Omit<
  SubAccountsBudgetTableProps<Table.TemplateSubAccountRow, Model.TemplateSubAccount, Model.TemplateGroup>,
  "manager" | "fringes" | "fringesCellRenderer" | "fringesCellRendererParams"
>): JSX.Element => {
  const history = useHistory();
  const detail = useSelector(selectTemplateDetail);
  const loadingTemplate = useSelector(selectTemplateDetailLoading);
  const fringes = useSelector(selectTemplateFringes);
  const templateId = useSelector(selectTemplateId);

  return (
    <SubAccountsBudgetTable<Table.TemplateSubAccountRow, Model.TemplateSubAccount, Model.TemplateGroup>
      manager={TemplateSubAccountRowManager}
      loadingBudget={loadingTemplate}
      fringes={fringes}
      fringesCellRenderer={"TemplateFringesCell"}
      fringesCellRendererParams={{
        onAddFringes: () => history.push(`/templates/${templateId}/fringes`)
      }}
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
  );
};

export default SubAccountsTable;
