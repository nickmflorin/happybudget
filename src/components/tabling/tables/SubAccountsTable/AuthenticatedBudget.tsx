import { useMemo } from "react";
import { isNil, find, map, filter } from "lodash";

import { model, tabling, hooks } from "lib";
import { framework } from "components/tabling/generic";

import { AuthenticatedBudgetTable, AuthenticatedBudgetTableProps } from "../BudgetTable";
import SubAccountsTable, { WithSubAccountsTableProps } from "./SubAccountsTable";
import Columns from "./Columns";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

export type AuthenticatedBudgetProps = Omit<AuthenticatedBudgetTableProps<R, M>, "columns"> & {
  readonly subAccountUnits: Model.Tag[];
  readonly fringes: Tables.FringeRow[];
  readonly categoryName: "Sub Account" | "Detail";
  readonly identifierFieldHeader: "Account" | "Line";
  readonly contacts: Model.Contact[];
  readonly exportFileName: string;
  readonly onGroupRows: (rows: Table.ModelRow<R>[]) => void;
  readonly onExportPdf: () => void;
  readonly onNewContact: (params: { name?: string; id: Table.ModelRowId }) => void;
  readonly onEditMarkup: (row: Table.MarkupRow<R>) => void;
  readonly onMarkupRows?: (rows: Table.ModelRow<R>[]) => void;
  readonly onEditContact: (id: number) => void;
  readonly onAddFringes: () => void;
  readonly onEditFringes: () => void;
};

const AuthenticatedBudgetSubAccountsTable = (
  props: WithSubAccountsTableProps<AuthenticatedBudgetProps>
): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined(props.table);

  const columns = useMemo(() => {
    return tabling.columns.normalizeColumns(Columns, {
      identifier: (col: Table.Column<R, M>) => ({
        cellRendererParams: {
          ...col.cellRendererParams,
          onGroupEdit: props.onEditGroup
        },
        headerName: props.identifierFieldHeader
      }),
      description: { headerName: `${props.categoryName} Description` },
      unit: {
        models: props.subAccountUnits
      },
      fringes: {
        cellEditor: "FringesEditor",
        cellEditorParams: { onAddFringes: props.onAddFringes },
        headerComponentParams: { onEdit: () => props.onEditFringes() },
        processCellFromClipboard: (value: string): number[] => {
          // NOTE: When pasting from the clipboard, the values will be a comma-separated
          // list of Fringe Names (assuming a rational user).  Currently, Fringe Names are
          // enforced to be unique, so we can map the Name back to the ID.  However, this might
          // not always be the case, in which case this logic breaks down.
          const names = value.split(",");
          const fs: Tables.FringeRow[] = filter(
            map(names, (name: string) => model.util.inferModelFromName<Tables.FringeRow>(props.fringes, name)),
            (f: Tables.FringeRow | null) => f !== null
          ) as Tables.FringeRow[];
          return map(fs, (f: Tables.FringeRow) => f.id);
        },
        processCellForClipboard: (row: R) => {
          const fringes = model.util.getModelsByIds<Tables.FringeRow>(props.fringes, row.fringes);
          return map(fringes, (fringe: Tables.FringeRow) => fringe.data.name).join(", ");
        }
      },
      contact: {
        cellRendererParams: { onEditContact: props.onEditContact },
        cellEditorParams: { onNewContact: props.onNewContact },
        models: props.contacts,
        modelClipboardValue: (m: Model.Contact) => m.full_name,
        onDataChange: (id: Table.ModelRowId, change: Table.CellChange<R>) => {
          // If a Row is assigned a Contact when it didn't previously have one, and the Row
          // does not have a populated value for `rate`, auto fill the `rate` field from the
          // Contact.
          if (change.oldValue === null && change.newValue !== null) {
            const row = table.current.getRow(id);
            if (!isNil(row) && tabling.typeguards.isModelRow(row) && row.data.rate === null) {
              const contact: Model.Contact | undefined = find(props.contacts, { id: change.newValue });
              if (!isNil(contact) && !isNil(contact.rate)) {
                table.current.applyTableChange({
                  type: "dataChange",
                  payload: { id: row.id, data: { rate: { oldValue: row.data.rate, newValue: contact.rate } } }
                });
              }
            }
          }
        },
        processCellFromClipboard: (name: string): number | null => {
          if (name.trim() === "") {
            return null;
          } else {
            const names = model.util.parseFirstAndLastName(name);
            const contact: Model.Contact | undefined = find(props.contacts, {
              first_name: names[0],
              last_name: names[1]
            });
            return contact?.id || null;
          }
        }
      }
    });
  }, [
    props.onEditGroup,
    props.onEditContact,
    props.onNewContact,
    props.onAddFringes,
    props.onEditFringes,
    props.categoryName,
    hooks.useDeepEqualMemo(props.fringes),
    hooks.useDeepEqualMemo(props.contacts),
    hooks.useDeepEqualMemo(props.subAccountUnits),
    props.identifierFieldHeader
  ]);

  return (
    <AuthenticatedBudgetTable<R, M>
      {...props}
      table={table}
      columns={columns}
      generateNewRowData={(rows: Table.BodyRow<R>[]) => {
        const dataRows = filter(rows, (r: Table.BodyRow<R>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<R>[];
        const numericIdentifiers: number[] = map(
          filter(dataRows, (r: Table.DataRow<R>) => !isNil(r.data.identifier) && !isNaN(parseInt(r.data.identifier))),
          (r: Table.DataRow<R>) => parseInt(r.data.identifier as string)
        );
        return { identifier: String(Math.max(...numericIdentifiers) + 1) };
      }}
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
      actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
        {
          icon: "folder",
          label: "Group",
          isWriteOnly: true,
          onClick: () => {
            const rows: Table.BodyRow<R>[] = table.current.getRowsAboveAndIncludingFocusedRow();
            const modelRows: Table.ModelRow<R>[] = filter(rows, (r: Table.BodyRow<R>) =>
              tabling.typeguards.isModelRow(r)
            ) as Table.ModelRow<R>[];
            if (modelRows.length !== 0) {
              props.onGroupRows?.(modelRows);
            }
          }
        },
        {
          icon: "badge-percent",
          label: "Mark Up",
          isWriteOnly: true,
          onClick: () => {
            const selectedRows = filter(params.selectedRows, (r: Table.BodyRow<R>) =>
              tabling.typeguards.isModelRow(r)
            ) as Table.ModelRow<R>[];
            /* eslint-disable indent */
            const rows: Table.ModelRow<R>[] =
              selectedRows.length !== 0
                ? selectedRows
                : (filter(table.current.getRows(), (r: Table.BodyRow<R>) =>
                    tabling.typeguards.isModelRow(r)
                  ) as Table.ModelRow<R>[]);
            if (rows.length !== 0) {
              props.onMarkupRows?.(rows);
            }
          }
        },
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ToggleColumnAction<R, M>(table.current, params),
        framework.actions.ExportPdfAction(props.onExportPdf),
        framework.actions.ExportCSVAction<R, M>(table.current, params, props.exportFileName)
      ]}
    />
  );
};

export default SubAccountsTable<AuthenticatedBudgetProps>(AuthenticatedBudgetSubAccountsTable);
