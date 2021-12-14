import React from "react";
import classNames from "classnames";

import { tabling } from "lib";

import { framework, WithConnectedTableProps } from "tabling/generic";
import { AuthenticatedModelTable, AuthenticatedModelTableProps } from "../ModelTable";
import Framework from "./framework";
import Columns from "./Columns";

type S = Tables.FringeTableStore;
type R = Tables.FringeRowData;
type M = Model.Fringe;

export interface Props extends Omit<AuthenticatedModelTableProps<R, M>, "columns" | "actions"> {
  readonly exportFileName: string;
}

const FringesTable: React.FC<WithConnectedTableProps<Props, R, M, S>> = ({ exportFileName, ...props }): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined<R, M>(props.table);

  return (
    <AuthenticatedModelTable<R, M>
      {...props}
      table={table}
      className={classNames("fringes-table", props.className)}
      actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
        framework.actions.ExportCSVAction<R, M>(table.current, params, exportFileName)
      ]}
      getModelRowName={(r: Table.DataRow<R>) => r.data.name}
      getModelRowLabel={"Fringe"}
      showPageFooter={false}
      framework={Framework}
      cookieNames={{ hiddenColumns: "fringes-table-hidden-columns" }}
      columns={Columns}
      confirmRowDelete={false}
      localizePopupParent
    />
  );
};

export default React.memo(FringesTable);
