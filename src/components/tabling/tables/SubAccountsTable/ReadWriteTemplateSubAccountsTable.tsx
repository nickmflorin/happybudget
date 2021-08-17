import { useMemo } from "react";
import { isNil, map, filter } from "lodash";

import { model, hooks, util, tabling } from "lib";

import { framework } from "components/tabling/generic";

import { ReadWriteBudgetTable, ReadWriteBudgetTableProps } from "../BudgetTable";
import SubAccountsTable, { SubAccountsTableProps, WithSubAccountsTableProps } from "./SubAccountsTable";

type R = Tables.SubAccountRow;
type M = Model.SubAccount;

export type ReadWriteTemplateSubAccountsTableProps = SubAccountsTableProps &
  Omit<ReadWriteBudgetTableProps<R, M>, "cookieNames" | "budgetType" | "getRowChildren" | "columns"> & {
    readonly budget?: Model.Template;
    readonly tableRef?: NonNullRef<BudgetTable.ReadWriteTableRefObj<R, M>>;
    readonly cookieNames: Table.CookieNames;
    readonly detail: Model.Account | M | undefined;
    readonly exportFileName: string;
    readonly onEditGroup: (group: Model.Group) => void;
    readonly onAddFringes: () => void;
    readonly onEditFringes: () => void;
  };

const ReadWriteTemplateSubAccountsTable = (
  props: WithSubAccountsTableProps<ReadWriteTemplateSubAccountsTableProps>
): JSX.Element => {
  const tableRef = tabling.hooks.useReadWriteBudgetTableIfNotDefined(props.tableRef);

  const columns = useMemo(() => {
    let cs: Table.Column<R, M>[] = util.updateInArray<Table.Column<R, M>>(
      props.columns,
      { field: "fringes" },
      {
        cellEditor: "FringesEditor",
        cellEditorParams: { onAddFringes: props.onAddFringes },
        headerComponentParams: { onEdit: () => props.onEditFringes() },
        processCellFromClipboard: (value: string) => {
          // NOTE: When pasting from the clipboard, the values will be a comma-separated
          // list of Fringe Names (assuming a rational user).  Currently, Fringe Names are
          // enforced to be unique, so we can map the Name back to the ID.  However, this might
          // not always be the case, in which case this logic breaks down.
          const names = value.split(",");
          const fs: Model.Fringe[] = filter(
            map(names, (name: string) => model.util.inferModelFromName<Model.Fringe>(props.fringes, name)),
            (f: Model.Fringe | null) => f !== null
          ) as Model.Fringe[];
          return map(fs, (f: Model.Fringe) => f.id);
        }
      }
    );
    cs = util.updateInArray<Table.Column<R, M>>(
      cs,
      { field: "identifier" },
      {
        cellRendererParams: {
          onGroupEdit: props.onEditGroup
        }
      }
    );
    return cs;
  }, [hooks.useDeepEqualMemo(props.columns)]);

  return (
    <ReadWriteBudgetTable<R, M>
      {...props}
      tableRef={tableRef}
      columns={[
        ...columns,
        framework.columnObjs.CalculatedColumn({
          field: "estimated",
          headerName: "Estimated",
          page: {
            value: !isNil(props.budget) && !isNil(props.budget.estimated) ? props.budget.estimated : 0.0
          },
          footer: {
            value: !isNil(props.detail) && !isNil(props.detail.estimated) ? props.detail.estimated : 0.0
          }
        })
      ]}
      budgetType={"template"}
      actions={(params: Table.ReadWriteMenuActionParams<R, M>) => [
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
        framework.actions.ExportCSVAction(tableRef.current, params, props.exportFileName)
      ]}
    />
  );
};

export default SubAccountsTable<ReadWriteTemplateSubAccountsTableProps>(ReadWriteTemplateSubAccountsTable);
