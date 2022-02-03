import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { framework } from "tabling/generic";
import { AuthenticatedTable, AuthenticatedTableProps } from "tabling/generic/tables";
import Columns from "./Columns";
import Framework from "./framework";

type R = Tables.FringeRowData;
type M = Model.Fringe;
type S = Tables.FringeTableStore;

type OmitProps =
  | "columns"
  | "showPageFooter"
  | "pinFirstColumn"
  | "tableId"
  | "menuPortalId"
  | "savingChangesPortalId"
  | "cookieNames"
  | "framework"
  | "getModelRowName"
  | "getMarkupRowName"
  | "getModelRowLabel"
  | "getMarkupRowLabel"
  | "onGroupRows"
  | "onMarkupRows"
  | "onEditMarkup"
  | "onEditGroup";

export type AuthenticatedFringesTableProps<B extends Model.BaseBudget> = Omit<
  AuthenticatedTableProps<R, M, S>,
  OmitProps
> & {
  readonly budget: B | null;
  readonly domain: B["domain"];
};

const AuthenticatedFringesTable = <B extends Model.BaseBudget>({
  budget,
  domain,
  ...props
}: AuthenticatedFringesTableProps<B>): JSX.Element => (
  <AuthenticatedTable<R, M, S>
    {...props}
    tableId={`${domain}-fringes`}
    className={classNames("fringes-table", props.className)}
    getModelRowName={(r: Table.DataRow<R>) => r.data.name}
    getModelRowLabel={"Fringe"}
    showPageFooter={false}
    framework={Framework}
    cookieNames={{ hiddenColumns: "fringes-table-hidden-columns" }}
    columns={Columns}
    confirmRowDelete={false}
    localizePopupParent
    actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
      framework.actions.ExportCSVAction<R, M>(
        props.table.current,
        params,
        !isNil(budget) ? `${budget.name}_fringes` : "fringes"
      )
    ]}
  />
);

export default React.memo(AuthenticatedFringesTable) as typeof AuthenticatedFringesTable;
