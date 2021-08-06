import { isNil } from "lodash";

import GenericAccountsTable, { GenericAccountsTableProps } from "./Generic";

type OmitTableProps = "budgetType" | "columns" | "tableFooterIdentifierValue" | "exportFileName";

export type TemplateAccountsTableProps = Omit<GenericAccountsTableProps, OmitTableProps> & {
  readonly template: Model.Template | undefined;
};

const TemplateAccountsTable = ({ template, ...props }: TemplateAccountsTableProps): JSX.Element => {
  return (
    <GenericAccountsTable
      {...props}
      budgetType={"template"}
      tableFooterIdentifierValue={!isNil(template) ? `${template.name} Total` : "Total"}
      exportFileName={!isNil(template) ? `budget_${template.name}_accounts` : ""}
      columns={[
        {
          field: "estimated",
          headerName: "Estimated",
          isCalculated: true,
          columnType: "sum",
          fieldBehavior: ["read"],
          footer: {
            value: !isNil(template) && !isNil(template.estimated) ? template.estimated : 0.0
          }
        }
      ]}
    />
  );
};

export default TemplateAccountsTable;
