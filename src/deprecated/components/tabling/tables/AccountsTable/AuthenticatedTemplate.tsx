import React from "react";

import AuthenticatedTable, { AuthenticatedTableProps } from "./AuthenticatedTable";
import Columns from "./Columns";

export type AuthenticatedTemplateProps = Omit<
  AuthenticatedTableProps<Model.Template>,
  "columns" | "includeCollaborators"
>;

const AuthenticatedTemplate = (props: AuthenticatedTemplateProps): JSX.Element => (
  <AuthenticatedTable<Model.Template>
    {...props}
    includeCollaborators={false}
    excludeColumns={["actual", "variance"]}
    columns={Columns}
  />
);

export default React.memo(AuthenticatedTemplate);
