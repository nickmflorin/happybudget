import { isNil, map } from "lodash";

import { model, tabling } from "lib";
import { framework } from "components/tabling/generic";

import {
  UnauthenticatedBudgetTable,
  UnauthenticatedBudgetTableProps,
  framework as budgetTableFramework
} from "../BudgetTable";
import SubAccountsTable, { WithSubAccountsTableProps } from "./SubAccountsTable";
import { UnauthenticatedBudgetColumns } from "./Columns";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

export type UnauthenticatedBudgetProps = Omit<
  Omit<UnauthenticatedBudgetTableProps<R, M>, "columns" | "getRowChildren"> &
    WithSubAccountsTableProps<{
      readonly tableFooterIdentifierValue: string;
      readonly subAccountUnits: Model.Tag[];
      readonly fringes: Tables.FringeRow[];
      readonly categoryName: "Sub Account" | "Detail";
      readonly identifierFieldHeader: "Account" | "Line";
      readonly budget?: Model.Budget;
      readonly tableRef?: NonNullRef<Table.AuthenticatedTableRefObj<R>>;
      readonly cookieNames: Table.CookieNames;
      readonly detail: Model.Account | M | undefined;
      readonly exportFileName: string;
    }>,
  "getRowChildren"
>;

const UnauthenticatedBudgetSubAccountsTable = (
  props: WithSubAccountsTableProps<UnauthenticatedBudgetProps>
): JSX.Element => {
  const tableRef = tabling.hooks.useUnauthenticatedTableIfNotDefined(props.tableRef);

  return (
    <UnauthenticatedBudgetTable<R, M>
      {...props}
      tableRef={tableRef}
      columns={tabling.columns.mergeColumns<Table.Column<R, M>, R, M>(UnauthenticatedBudgetColumns, {
        identifier: (col: Table.Column<R, M>) =>
          budgetTableFramework.columnObjs.IdentifierColumn<R, M>({
            ...col,
            tableFooterLabel: props.tableFooterIdentifierValue,
            pageFooterLabel: !isNil(props.budget) ? `${props.budget.name} Total` : "Budget Total",
            headerName: props.identifierFieldHeader
          }),
        description: { headerName: `${props.categoryName} Description` },
        unit: (col: Table.Column<R, M>) =>
          framework.columnObjs.TagSelectColumn<R, M>({ ...col, models: props.subAccountUnits }),
        fringes: {
          processCellForClipboard: (row: R) => {
            const fringes = model.util.getModelsByIds<Tables.FringeRow>(props.fringes, row.fringes);
            return map(fringes, (fringe: Tables.FringeRow) => fringe.name).join(", ");
          }
        },
        estimated: {
          page: {
            value: !isNil(props.budget) && !isNil(props.budget.estimated) ? props.budget.estimated : 0.0
          },
          footer: {
            value: !isNil(props.budget) && !isNil(props.budget.estimated) ? props.budget.estimated : 0.0
          }
        },
        actual: {
          page: {
            value: !isNil(props.budget) && !isNil(props.budget.actual) ? props.budget.actual : 0.0
          },
          footer: {
            value: !isNil(props.budget) && !isNil(props.budget.actual) ? props.budget.actual : 0.0
          }
        },
        variance: {
          page: {
            value: !isNil(props.budget) && !isNil(props.budget.variance) ? props.budget.variance : 0.0
          },
          footer: {
            value: !isNil(props.budget) && !isNil(props.budget.variance) ? props.budget.variance : 0.0
          }
        }
      })}
      actions={(params: Table.UnauthenticatedMenuActionParams<R, M>) => [
        {
          icon: "folder",
          disabled: true,
          label: "Group",
          isWriteOnly: true
        },
        {
          icon: "badge-percent",
          disabled: true,
          label: "Mark Up",
          isWriteOnly: true
        },
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ToggleColumnAction<R, M>(tableRef.current, params),
        framework.actions.ExportCSVAction<R, M>(tableRef.current, params, props.exportFileName)
      ]}
    />
  );
};

export default SubAccountsTable<UnauthenticatedBudgetProps>(UnauthenticatedBudgetSubAccountsTable);
