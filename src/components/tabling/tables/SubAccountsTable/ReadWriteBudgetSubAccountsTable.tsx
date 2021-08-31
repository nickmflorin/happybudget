import { useMemo } from "react";
import { isNil, find, map, filter } from "lodash";

import { model, hooks, util, tabling } from "lib";
import { framework } from "components/tabling/generic";

import { ReadWriteBudgetTable, ReadWriteBudgetTableProps } from "../BudgetTable";
import SubAccountsTable, { SubAccountsTableProps, WithSubAccountsTableProps } from "./SubAccountsTable";

type R = Tables.SubAccountRow;
type M = Model.SubAccount;

type PreContactCreate = Omit<Table.CellChange<R, M>, "newValue">;

export type ReadWriteBudgetSubAccountsTableProps = SubAccountsTableProps &
  Omit<ReadWriteBudgetTableProps<R, M>, "cookieNames" | "budgetType" | "getRowChildren" | "columns"> & {
    readonly budget?: Model.Budget;
    readonly tableRef?: NonNullRef<BudgetTable.ReadWriteTableRefObj<R, M>>;
    readonly cookieNames: Table.CookieNames;
    readonly detail: Model.Account | M | undefined;
    readonly contacts: Model.Contact[];
    readonly exportFileName: string;
    readonly onExportPdf: () => void;
    readonly onNewContact: (params: { name?: string; change: PreContactCreate }) => void;
    readonly onEditContact: (id: number) => void;
    readonly onEditGroup: (group: Model.Group) => void;
    readonly onAddFringes: () => void;
    readonly onEditFringes: () => void;
  };

const ReadWriteBudgetSubAccountsTable = (
  props: WithSubAccountsTableProps<ReadWriteBudgetSubAccountsTableProps>
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
        framework.columnObjs.ModelSelectColumn<R, M, Model.Contact>({
          field: "contact",
          headerName: "Contact",
          cellRenderer: { data: "ContactCell" },
          cellEditor: "ContactEditor",
          cellRendererParams: { onEditContact: props.onEditContact },
          cellEditorParams: { onNewContact: props.onNewContact },
          columnType: "contact",
          index: 2,
          width: 200,
          models: props.contacts,
          modelClipboardValue: (m: Model.Contact) => m.full_name,
          processCellFromClipboard: (name: string): Model.Contact | null => {
            if (name.trim() === "") {
              return null;
            } else {
              const names = model.util.parseFirstAndLastName(name);
              const contact: Model.Contact | undefined = find(props.contacts, {
                first_name: names[0],
                last_name: names[1]
              });
              return contact || null;
            }
          }
        }),
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
        }),
        framework.columnObjs.CalculatedColumn({
          field: "actual",
          headerName: "Actual",
          page: {
            value: !isNil(props.budget) && !isNil(props.budget.actual) ? props.budget.actual : 0.0
          },
          footer: {
            value: !isNil(props.detail) && !isNil(props.detail.actual) ? props.detail.actual : 0.0
          }
        }),
        framework.columnObjs.CalculatedColumn({
          field: "variance",
          headerName: "Variance",
          page: {
            value: !isNil(props.budget) && !isNil(props.budget.variance) ? props.budget.variance : 0.0
          },
          footer: {
            value: !isNil(props.detail) && !isNil(props.detail.variance) ? props.detail.variance : 0.0
          }
        })
      ]}
      budgetType={"budget"}
      onCellFocusChanged={(params: Table.CellFocusChangedParams<R, M>) => {
        /*
        For the ContactCell, we want the contact tag in the cell to be clickable
        only when the cell is focused.  This means we have to rerender the cell when
        it becomes focused or unfocused so that the tag becomes clickable (in the focused
        case) or unclickable (in the unfocused case).
        */
        const rowNodes: Table.RowNode[] = [];
        if (params.cell.column.field === "contact") {
          rowNodes.push(params.cell.rowNode);
        }
        if (!isNil(params.previousCell) && params.previousCell.column.field === "contact") {
          rowNodes.push(params.previousCell.rowNode);
        }
        if (rowNodes.length !== 0) {
          params.apis.grid.refreshCells({
            force: true,
            rowNodes,
            columns: ["contact"]
          });
        }
      }}
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
        framework.actions.ExportPdfAction(props.onExportPdf),
        framework.actions.ExportCSVAction(tableRef.current, params, props.exportFileName)
      ]}
    />
  );
};

export default SubAccountsTable<ReadWriteBudgetSubAccountsTableProps>(ReadWriteBudgetSubAccountsTable);
