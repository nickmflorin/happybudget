import React from "react";
import AuthenticatedTable, { AuthenticatedTableProps } from "./AuthenticatedTable";
import Columns from "./Columns";

export type AuthenticatedTemplateProps<P extends Model.Account | Model.SubAccount> = Omit<
  AuthenticatedTableProps<Model.Template, P>,
  "domain" | "columns" | "excludeColumns"
>;

const AuthenticatedTemplate = <P extends Model.Account | Model.SubAccount>(
  props: AuthenticatedTemplateProps<P>
): JSX.Element => {
  return (
    <AuthenticatedTable
      {...props}
      excludeColumns={["actual", "contact", "variance", "attachments"]}
      domain={"template"}
      columns={Columns}
    />
  );
};

export default React.memo(AuthenticatedTemplate) as typeof AuthenticatedTemplate;
