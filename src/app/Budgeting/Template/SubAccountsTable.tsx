import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { TemplateSubAccountRowManager } from "lib/tabling/managers";

import { selectTemplateFringes, selectTemplateDetail, selectTemplateDetailLoading } from "../store/selectors";
import SubAccountsBudgetTable, { SubAccountsBudgetTableProps } from "../SubAccountsBudgetTable";

const SubAccountsTable = ({
  ...props
}: Omit<
  SubAccountsBudgetTableProps<Table.TemplateSubAccountRow, Model.TemplateSubAccount, Model.TemplateGroup>,
  "manager" | "fringes" | "fringesCellRenderer"
>): JSX.Element => {
  const detail = useSelector(selectTemplateDetail);
  const loadingTemplate = useSelector(selectTemplateDetailLoading);
  const fringes = useSelector(selectTemplateFringes);

  return (
    <SubAccountsBudgetTable<Table.TemplateSubAccountRow, Model.TemplateSubAccount, Model.TemplateGroup>
      manager={TemplateSubAccountRowManager}
      loadingBudget={loadingTemplate}
      fringes={fringes}
      fringesCellRenderer={"TemplateFringesCell"}
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
