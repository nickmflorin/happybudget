import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { framework } from "tabling/generic";
import { PublicTable, PublicTableProps } from "tabling/generic/tables";
import Columns from "./Columns";
import Framework from "./framework";

type R = Tables.FringeRowData;
type M = Model.Fringe;
type S = Tables.FringeTableStore;

type OmitProps =
  | "columns"
  | "showPageFooter"
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

export type PublicFringesTableProps<B extends Model.BaseBudget, P extends Model.Account | Model.SubAccount> = Omit<
  PublicTableProps<R, M, FringesTableContext<B, P, true>, S>,
  OmitProps
> & {
  readonly budget: B | null;
};

const PublicFringesTable = <B extends Model.BaseBudget, P extends Model.Account | Model.SubAccount>({
  budget,
  ...props
}: PublicFringesTableProps<B, P>): JSX.Element => (
  <PublicTable<R, M, FringesTableContext<B, P, true>, S>
    {...props}
    tableId={`public-${props.tableContext.domain}-fringes`}
    className={classNames("fringes-table", props.className)}
    showPageFooter={false}
    framework={Framework}
    columns={Columns}
    actions={(params: Table.PublicMenuActionParams<R, M>) => [
      framework.actions.ExportCSVAction<R, M>(
        props.table.current,
        params,
        !isNil(budget) ? `${budget.name}_fringes` : "fringes"
      )
    ]}
  />
);

export default React.memo(PublicFringesTable) as typeof PublicFringesTable;
