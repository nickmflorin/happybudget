import React, { useMemo } from "react";
import { isNil, find, map, filter } from "lodash";

import * as api from "api";
import { model, tabling, hooks } from "lib";
import { framework } from "components/tabling/generic";

import { useAttachments } from "../hooks";
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
  readonly onAttachmentRemoved: (row: Table.ModelRow<R>, id: number) => void;
  readonly onAttachmentAdded: (row: Table.ModelRow<R>, attachment: Model.Attachment) => void;
  readonly onGroupRows: (rows: Table.ModelRow<R>[]) => void;
  readonly onExportPdf: () => void;
  readonly onSearchContact: (v: string) => void;
  readonly onNewContact: (params: { name?: string; id: Table.ModelRowId }) => void;
  readonly onEditMarkup: (row: Table.MarkupRow<R>) => void;
  readonly onMarkupRows?: (rows?: Table.ModelRow<R>[]) => void;
  readonly onEditContact: (params: { contact: number; id: Table.EditableRowId }) => void;
  readonly onAddFringes: () => void;
  readonly onEditFringes: () => void;
};

const AuthenticatedBudgetSubAccountsTable = (
  props: WithSubAccountsTableProps<AuthenticatedBudgetProps>
): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined(props.table);
  const [processAttachmentsCellForClipboard, processAttachmentsCellFromClipboard, setEditAttachments, modal] =
    useAttachments({
      table: table.current,
      onAttachmentRemoved: props.onAttachmentRemoved,
      onAttachmentAdded: props.onAttachmentAdded,
      listAttachments: api.getSubAccountAttachments,
      uploadAttachment: api.uploadSubAccountAttachment,
      deleteAttachment: api.deleteSubAccountAttachment,
      path: (id: number) => `/v1/subaccounts/${id}/attachments/`
    });

  const processUnitCellFromClipboard = hooks.useDynamicCallback((name: string): Model.Tag | null =>
    model.util.inferModelFromName<Model.Tag>(props.subAccountUnits, name, { nameField: "title" })
  );

  const processContactCellForClipboard = hooks.useDynamicCallback((row: R) => {
    const id = row.contact;
    if (isNil(id)) {
      return "";
    }
    const m: Model.Contact | undefined = find(props.contacts, { id } as any);
    return m?.full_name || "";
  });

  const processContactCellFromClipboard = hooks.useDynamicCallback((name: string) => {
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
  });

  const processFringesCellForClipboard = hooks.useDynamicCallback((row: R) => {
    const fringes = model.util.getModelsByIds<Tables.FringeRow>(props.fringes, row.fringes);
    return map(fringes, (fringe: Tables.FringeRow) => fringe.data.name).join(", ");
  });

  const processFringesCellFromClipboard = hooks.useDynamicCallback((value: string) => {
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
  });

  const columns = useMemo(() => {
    return tabling.columns.normalizeColumns(Columns, {
      identifier: (col: Table.Column<R, M>) => ({
        headerName: props.identifierFieldHeader
      }),
      description: { headerName: `${props.categoryName} Description` },
      attachments: {
        onCellDoubleClicked: (row: Table.ModelRow<R>) => setEditAttachments(row.id),
        processCellFromClipboard: processAttachmentsCellFromClipboard,
        processCellForClipboard: processAttachmentsCellForClipboard
      },
      unit: {
        processCellFromClipboard: processUnitCellFromClipboard
      },
      fringes: {
        cellEditor: "FringesEditor",
        cellEditorParams: { onAddFringes: props.onAddFringes },
        headerComponentParams: { onEdit: () => props.onEditFringes() },
        processCellFromClipboard: processFringesCellFromClipboard,
        processCellForClipboard: processFringesCellForClipboard
      },
      contact: {
        cellRendererParams: { onEditContact: props.onEditContact },
        cellEditorParams: { onNewContact: props.onNewContact, setSearch: props.onSearchContact },
        onDataChange: (id: Table.ModelRowId, change: Table.CellChange<R>) => {
          // If the Row does not already have a populated value for `rate`, we populate
          // the `rate` value based on the selected Contact (if non-null).
          if (change.newValue !== null) {
            const row = table.current.getRow(id);
            if (!isNil(row) && tabling.typeguards.isModelRow(row) && row.data.rate === null) {
              const contact: Model.Contact | undefined = find(props.contacts, { id: change.newValue } as any);
              if (!isNil(contact) && !isNil(contact.rate)) {
                table.current.applyTableChange({
                  type: "dataChange",
                  payload: { id: row.id, data: { rate: { oldValue: row.data.rate, newValue: contact.rate } } }
                });
              }
            }
          }
        },
        processCellForClipboard: processContactCellForClipboard,
        processCellFromClipboard: processContactCellFromClipboard
      }
    });
  }, [
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
    <React.Fragment>
      <AuthenticatedBudgetTable<R, M>
        {...props}
        table={table}
        columns={columns}
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
              let rows = filter(params.selectedRows, (r: Table.BodyRow<R>) =>
                tabling.typeguards.isModelRow(r)
              ) as Table.ModelRow<R>[];
              if (rows.length === 0) {
                const focusedRow = table.current.getFocusedRow();
                if (!isNil(focusedRow) && tabling.typeguards.isModelRow(focusedRow)) {
                  rows = [focusedRow];
                }
              }
              if (rows.length !== 0) {
                props.onGroupRows?.(rows);
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
              // If rows are explicitly selected for the Markup, we want to include them
              // as the default children for the Markup in the modal, which will default the
              // unit in the modal to PERCENT.
              if (selectedRows.length !== 0) {
                props.onMarkupRows?.(selectedRows);
              } else {
                const rows: Table.ModelRow<R>[] = filter(table.current.getRows(), (r: Table.BodyRow<R>) =>
                  tabling.typeguards.isModelRow(r)
                ) as Table.ModelRow<R>[];
                if (rows.length !== 0) {
                  props.onMarkupRows?.();
                }
              }
            }
          },
          ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
          framework.actions.ToggleColumnAction<R, M>(table.current, params),
          framework.actions.ExportPdfAction(props.onExportPdf),
          framework.actions.ExportCSVAction<R, M>(table.current, params, props.exportFileName)
        ]}
      />
      {modal}
    </React.Fragment>
  );
};

export default SubAccountsTable<AuthenticatedBudgetProps>(AuthenticatedBudgetSubAccountsTable);
