import { isNil, map } from "lodash";

import { model, tabling } from "lib";
import { framework } from "components/tabling/generic";

import {
  UnauthenticatedBudgetTable,
  UnauthenticatedBudgetTableProps,
  framework as budgetTableFramework
} from "../BudgetTable";
import SubAccountsTable, { WithSubAccountsTableProps } from "./SubAccountsTable";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

export type UnauthenticatedBudgetProps = Omit<UnauthenticatedBudgetTableProps<R, M>, "columns"> & {
  readonly subAccountUnits: Model.Tag[];
  readonly fringes: Tables.FringeRow[];
  readonly categoryName: "Sub Account" | "Detail";
  readonly identifierFieldHeader: "Account" | "Line";
  readonly tableRef?: NonNullRef<Table.AuthenticatedTableRefObj<R>>;
  readonly cookieNames: Table.CookieNames;
  readonly exportFileName: string;
};

const UnauthenticatedBudgetSubAccountsTable = (
  props: WithSubAccountsTableProps<UnauthenticatedBudgetProps>
): JSX.Element => {
  const tableRef = tabling.hooks.useUnauthenticatedTableIfNotDefined(props.tableRef);

  return (
    <UnauthenticatedBudgetTable<R, M>
      {...props}
      tableRef={tableRef}
      columns={tabling.columns.mergeColumns<Table.Column<R, M>, R, M>(props.columns, {
        identifier: (col: Table.Column<R, M>) =>
          budgetTableFramework.columnObjs.IdentifierColumn<R, M>({
            ...col,
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
