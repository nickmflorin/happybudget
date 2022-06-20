import { useMemo } from "react";
import { useSelector } from "react-redux";
import { map } from "lodash";

import { model, tabling, hooks, formatters } from "lib";

import { selectors } from "app/Budgeting/store";
import { PublicBudgetTable, PublicBudgetTableProps } from "../BudgetTable";
import useKeyboardNavigation, { UseKeyboardNavigationReturnType } from "./useKeyboardNavigation";
import { Framework } from "./framework";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type S = Tables.SubAccountTableStore;

type OmitProps =
  | keyof UseKeyboardNavigationReturnType<R>
  | "showPageFooter"
  | "pinFirstColumn"
  | "tableId"
  | "menuPortalId"
  | "framework";

export type PublicTableProps<B extends Model.BaseBudget, P extends Model.Account | Model.SubAccount> = Omit<
  PublicBudgetTableProps<R, M, B, SubAccountsTableActionContext<B, P, true>, S>,
  OmitProps
> & {
  readonly parent: P | null;
  readonly tokenId: string;
  readonly onViewFringes: () => void;
};

const PublicTable = <B extends Model.BaseBudget, P extends Model.Account | Model.SubAccount>(
  props: PublicTableProps<B, P>
): JSX.Element => {
  const { onBack, onLeft, onRight, onRowExpand } = useKeyboardNavigation<B, P, R, true>(props);

  const fringes = useSelector((s: Application.Store) => selectors.selectFringes(s, props.tableContext));

  const processFringesCellForClipboard = hooks.useDynamicCallback((row: R) => {
    const fs = model.getModels<Tables.FringeRow>(fringes, row.fringes, { modelName: "fringe" });
    return map(fs, (fringe: Tables.FringeRow) => fringe.id).join(", ");
  });

  const columns = useMemo(
    () =>
      tabling.columns.normalizeColumns(props.columns, {
        fringes: {
          headerComponentParams: { onEdit: () => props.onViewFringes() },
          processCellForClipboard: processFringesCellForClipboard
        },
        identifier: { headerName: props.tableContext.parentType === "account" ? "Account" : "Line" },
        description: {
          headerName: `${props.tableContext.parentType === "account" ? "SubAccount" : "Detail"} Description`
        }
      }),
    [
      props.onViewFringes,
      props.tableContext.parentType,
      hooks.useDeepEqualMemo(props.columns),
      processFringesCellForClipboard
    ]
  );

  return (
    <PublicBudgetTable
      {...props}
      columns={columns}
      menuPortalId={"supplementary-header"}
      showPageFooter={true}
      pinFirstColumn={true}
      tableId={`public-${props.tableContext.domain}-${props.tableContext.parentType}-subaccounts`}
      framework={Framework}
      onBack={onBack}
      onRowExpand={onRowExpand}
      onLeft={onLeft}
      onRight={onRight}
      calculatedCellInfoTooltip={(cell: Table.CellConstruct<Table.ModelRow<R>, Table.CalculatedColumn<R, M>>) =>
        cell.row.children.length === 0 &&
        cell.col.field === "estimated" &&
        model.budgeting.estimatedValue(cell.row) !== 0
          ? [
              {
                label: "Nominal Value",
                value: cell.row.data.nominal_value,
                formatter: formatters.currencyFormatter
              },
              {
                label: "Fringe Contribution",
                value: cell.row.data.fringe_contribution,
                formatter: formatters.currencyFormatter
              },
              {
                label: "Markup Contribution",
                value: cell.row.data.markup_contribution,
                formatter: formatters.currencyFormatter
              }
            ]
          : null
      }
    />
  );
};

export default PublicTable;
