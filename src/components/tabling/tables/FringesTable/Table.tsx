import classNames from "classnames";

import { tabling } from "lib";

import { framework, WithConnectedTableProps } from "components/tabling/generic";
import { AuthenticatedModelTable, AuthenticatedModelTableProps } from "../ModelTable";
import Framework from "./framework";
import Columns from "./Columns";

type S = Tables.FringeTableStore;
type R = Tables.FringeRowData;
type M = Model.Fringe;

export interface Props extends Omit<AuthenticatedModelTableProps<R, M>, "columns" | "actions"> {
  readonly exportFileName: string;
}

const FringesTable: React.FC<WithConnectedTableProps<Props, R, M, Model.Group, S>> = ({
  exportFileName,
  ...props
}): JSX.Element => {
  const tableRef = tabling.hooks.useAuthenticatedTableIfNotDefined<R>(props.tableRef);

  return (
    <AuthenticatedModelTable<R, M>
      {...props}
      tableRef={tableRef}
      className={classNames("fringes-table", props.className)}
      actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
        framework.actions.ExportCSVAction<R, M>(tableRef.current, params, exportFileName)
      ]}
      showPageFooter={false}
      framework={Framework}
      cookieNames={{ hiddenColumns: "fringes-table-hidden-columns" }}
      columns={Columns}
    />
  );
};

export default FringesTable;
