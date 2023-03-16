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
  | "framework"
  | "getModelRowName"
  | "getMarkupRowName"
  | "getModelRowLabel"
  | "getMarkupRowLabel"
  | "onGroupRows"
  | "onMarkupRows"
  | "onEditMarkup"
  | "onEditGroup";

export type AuthenticatedFringesTableProps<
  B extends Model.BaseBudget,
  P extends Model.Account | Model.SubAccount,
> = Omit<AuthenticatedTableProps<R, M, FringesTableContext<B, P, false>, S>, OmitProps> & {
  readonly budget: B | null;
};

const AuthenticatedFringesTable = <
  B extends Model.BaseBudget,
  P extends Model.Account | Model.SubAccount,
>({
  budget,
  ...props
}: AuthenticatedFringesTableProps<B, P>): JSX.Element => (
  <AuthenticatedTable<R, M, FringesTableContext<B, P, false>, S>
    {...props}
    tableId={`${props.tableContext.domain}-fringes`}
    className={classNames("fringes-table", props.className)}
    getModelRowName={(r: Table.DataRow<R>) => r.data.name}
    getModelRowLabel="Fringe"
    showPageFooter={false}
    framework={Framework}
    columns={Columns}
    confirmRowDelete={false}
    localizePopupParent
    actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
      framework.actions.ExportCSVAction<R, M>(
        props.table.current,
        params,
        !isNil(budget) ? `${budget.name}_fringes` : "fringes",
      ),
    ]}
  />
);

export default React.memo(AuthenticatedFringesTable) as typeof AuthenticatedFringesTable;
