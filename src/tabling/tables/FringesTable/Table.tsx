import React from "react";
import classNames from "classnames";

import { framework, WithConnectedTableProps } from "tabling/generic";
import { AuthenticatedModelTable, AuthenticatedModelTableProps } from "../ModelTable";
import Framework from "./framework";
import Columns from "./Columns";

type S = Tables.FringeTableStore;
type R = Tables.FringeRowData;
type M = Model.Fringe;

export interface Props extends Omit<AuthenticatedModelTableProps<R, M, S>, "columns" | "actions"> {
  readonly exportFileName: string;
  readonly actionContext: Tables.FringeTableContext;
}

const FringesTable: React.FC<WithConnectedTableProps<Props, R, M, S>> = ({ exportFileName, ...props }): JSX.Element => {
  return (
    <AuthenticatedModelTable<R, M, S>
      {...props}
      className={classNames("fringes-table", props.className)}
      actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
        framework.actions.ExportCSVAction<R, M>(props.table.current, params, exportFileName)
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
