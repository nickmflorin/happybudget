import { isNil } from "lodash";

import GenericSubAccountsTable, { GenericSubAccountsTableProps } from "./Generic";

type OmitTableProps = "budgetType" | "columns";

export interface TemplateSubAccountsTableProps extends Omit<GenericSubAccountsTableProps, OmitTableProps> {
  readonly detail: Model.Account | Model.SubAccount | undefined;
  readonly template: Model.Template | undefined;
}

const TemplateSubAccountsTable = ({ detail, template, ...props }: TemplateSubAccountsTableProps): JSX.Element => {
  return (
    <GenericSubAccountsTable
      {...props}
      budgetType={"template"}
      columns={[
        {
          field: "estimated",
          headerName: "Estimated",
          isCalculated: true,
          columnType: "sum",
          fieldBehavior: ["read"],
          page: {
            value: !isNil(template) && !isNil(template.estimated) ? template.estimated : 0.0
          },
          footer: {
            value: !isNil(detail) && !isNil(detail.estimated) ? detail.estimated : 0.0
          }
        }
      ]}
    />
  );
};

export default TemplateSubAccountsTable;
