import React from "react";
import AuthenticatedTable, { AuthenticatedTableProps } from "./AuthenticatedTable";
import Columns from "./Columns";

export type AuthenticatedTemplateProps<P extends Model.Account | Model.SubAccount> = Omit<
  AuthenticatedTableProps<Model.Template, P>,
  "columns" | "excludeColumns" | "includeCollaborators"
>;

const AuthenticatedTemplate = <P extends Model.Account | Model.SubAccount>(
  props: AuthenticatedTemplateProps<P>
): JSX.Element => {
  return (
    <AuthenticatedTable
      {...props}
      includeCollaborators={false}
      excludeColumns={["actual", "contact", "variance", "attachments"]}
      columns={Columns}
    />
  );
};

export default React.memo(AuthenticatedTemplate) as typeof AuthenticatedTemplate;
