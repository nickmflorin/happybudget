import React, { useMemo } from "react";
import { isNil, map } from "lodash";

import { models, tabling, hooks } from "lib";
import { framework } from "tabling/generic";

import { PublicBudgetTable, PublicBudgetTableProps } from "../BudgetTable";
import SubAccountsTable, { WithSubAccountsTableProps } from "./SubAccountsTable";
import Columns from "./Columns";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type S = Tables.SubAccountTableStore;

export type PublicBudgetProps = Omit<PublicBudgetTableProps<R, M, S>, "columns"> & {
  readonly subAccountUnits: Model.Tag[];
  readonly fringes: Tables.FringeRow[];
  readonly categoryName: "Sub Account" | "Detail";
  readonly identifierFieldHeader: "Account" | "Line";
  readonly exportFileName: string;
};

const PublicBudgetSubAccountsTable = (props: WithSubAccountsTableProps<PublicBudgetProps>): JSX.Element => {
  const processFringesCellForClipboard = hooks.useDynamicCallback((row: R) => {
    const fringes = models.getModels<Tables.FringeRow>(props.fringes, row.fringes, { modelName: "fringe" });
    return map(fringes, (fringe: Tables.FringeRow) => fringe.data.name).join(", ");
  });

  const columns = useMemo(
    () =>
      tabling.columns.normalizeColumns(Columns, {
        identifier: {
          headerName: props.identifierFieldHeader
        },
        description: { headerName: `${props.categoryName} Description` },
        unit: (col: Table.BodyColumn<R, M>) => ({ ...col, models: props.subAccountUnits }),
        fringes: {
          processCellForClipboard: processFringesCellForClipboard
        }
      }),
    [props.fringes, props.categoryName, props.subAccountUnits, props.identifierFieldHeader]
  );

  return (
    <PublicBudgetTable<R, M, S>
      {...props}
      columns={columns}
      actions={(params: Table.PublicMenuActionParams<R, M>) => [
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ToggleColumnAction<R, M>(props.table.current, params),
        framework.actions.ExportCSVAction<R, M>(props.table.current, params, props.exportFileName)
      ]}
    />
  );
};

export default React.memo(SubAccountsTable<PublicBudgetProps>(PublicBudgetSubAccountsTable));
