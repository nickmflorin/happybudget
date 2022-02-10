import React, { useMemo } from "react";
import { isNil, find, map, filter } from "lodash";

import * as api from "api";
import { models, tabling, hooks } from "lib";
import { framework } from "tabling/generic";

import { useAttachments } from "../hooks";
import { withContacts, WithContactsProps, WithWithContactsProps } from "../hocs";
import { AuthenticatedBudgetTable, AuthenticatedBudgetTableProps } from "../BudgetTable";
import SubAccountsTable, { WithSubAccountsTableProps } from "./SubAccountsTable";
import Columns from "./Columns";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type S = Tables.SubAccountTableStore;

export type AuthenticatedBudgetProps = Omit<AuthenticatedBudgetTableProps<R, M, S>, "columns"> &
  WithContactsProps & {
    readonly actionContext: Tables.SubAccountTableContext;
    readonly subAccountUnits: Model.Tag[];
    readonly fringes: Tables.FringeRow[];
    readonly categoryName: "Sub Account" | "Detail";
    readonly identifierFieldHeader: "Account" | "Line";
    readonly exportFileName: string;
    readonly onAttachmentRemoved: (row: Table.ModelRow<R>, id: number) => void;
    readonly onAttachmentAdded: (row: Table.ModelRow<R>, attachment: Model.Attachment) => void;
    readonly onGroupRows: (rows: Table.ModelRow<R>[]) => void;
    readonly onExportPdf: () => void;
    readonly onEditMarkup: (row: Table.MarkupRow<R>) => void;
    readonly onMarkupRows: (rows?: Table.ModelRow<R>[]) => void;
    readonly onAddFringes: () => void;
    readonly onEditFringes: () => void;
  };

const AuthenticatedBudgetSubAccountsTable = (
  props: WithWithContactsProps<WithSubAccountsTableProps<AuthenticatedBudgetProps>, R, M>
): JSX.Element => {
  const [processAttachmentsCellForClipboard, processAttachmentsCellFromClipboard, setEditAttachments, modal] =
    useAttachments({
      table: props.table.current,
      onAttachmentRemoved: props.onAttachmentRemoved,
      onAttachmentAdded: props.onAttachmentAdded,
      listAttachments: api.getSubAccountAttachments,
      deleteAttachment: api.deleteSubAccountAttachment,
      path: (id: number) => `/v1/subaccounts/${id}/attachments/`
    });

  const processUnitCellFromClipboard = hooks.useDynamicCallback((name: string): Model.Tag | null =>
    models.inferModelFromName<Model.Tag>(props.subAccountUnits, name, {
      getName: (m: Model.Tag) => m.title,
      warnOnMissing: false
    })
  );

  const processFringesCellForClipboard = hooks.useDynamicCallback((row: R) => {
    const fringes = models.getModels<Tables.FringeRow>(props.fringes, row.fringes, { modelName: "fringe" });
    return map(fringes, (fringe: Tables.FringeRow) => fringe.id).join(", ");
  });

  const processFringesCellFromClipboard = hooks.useDynamicCallback((value: string) => {
    /* Here, we convert from IDs to Rows then back to IDs to ensure that the
       IDs are valid. */
    return map(
      models.getModels<Tables.FringeRow>(props.fringes, models.parseIdsFromDeliminatedString(value), {
        warnOnMissing: false,
        modelName: "fringe"
      }),
      (m: Tables.FringeRow) => m.id
    );
  });

  const columns = useMemo(() => {
    return tabling.columns.normalizeColumns(props.columns, {
      identifier: {
        headerName: props.identifierFieldHeader
      },
      description: { headerName: `${props.categoryName} Description` },
      attachments: (col: Table.Column<R, M>) => ({
        onCellDoubleClicked: (row: Table.ModelRow<R>) => setEditAttachments(row.id),
        processCellFromClipboard: processAttachmentsCellFromClipboard,
        processCellForClipboard: processAttachmentsCellForClipboard,
        cellRendererParams: {
          ...col.cellRendererParams,
          onAttachmentAdded: props.onAttachmentAdded,
          uploadAttachmentsPath: (id: number) => `/v1/subaccounts/${id}/attachments/`
        }
      }),
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
        onDataChange: (id: Table.ModelRowId, change: Table.CellChange) => {
          /* If the Row does not already have a populated value for `rate`,
						 we populate the `rate` value based on the selected Contact
						 (if non-null). */
          if (change.newValue !== null) {
            const row = props.table.current.getRow(id);
            if (!isNil(row) && tabling.typeguards.isModelRow(row) && row.data.rate === null) {
              const contact: Model.Contact | undefined = find(props.contacts, { id: change.newValue });
              if (!isNil(contact) && !isNil(contact.rate)) {
                props.table.current.applyTableChange({
                  type: "dataChange",
                  payload: { id: row.id, data: { rate: { oldValue: row.data.rate, newValue: contact.rate } } }
                });
              }
            }
          }
        }
      }
    });
  }, [
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
        columns={columns}
        actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
          {
            icon: "folder",
            label: "Subtotal",
            isWriteOnly: true,
            onClick: () => {
              let rows = filter(params.selectedRows, (r: Table.BodyRow<R>) =>
                tabling.typeguards.isModelRow(r)
              ) as Table.ModelRow<R>[];
              if (rows.length === 0) {
                const focusedRow = props.table.current.getFocusedRow();
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
              /* If rows are explicitly selected for the Markup, we want to
								 include them as the default children for the Markup in the
								 modal, which will default the unit in the modal to PERCENT. */
              if (selectedRows.length !== 0) {
                props.onMarkupRows?.(selectedRows);
              } else {
                const rows: Table.ModelRow<R>[] = filter(props.table.current.getRows(), (r: Table.BodyRow<R>) =>
                  tabling.typeguards.isModelRow(r)
                ) as Table.ModelRow<R>[];
                if (rows.length !== 0) {
                  props.onMarkupRows?.();
                }
              }
            }
          },
          ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
          framework.actions.ToggleColumnAction<R, M>(props.table.current, params),
          framework.actions.ExportPdfAction(props.onExportPdf),
          framework.actions.ExportCSVAction<R, M>(props.table.current, params, props.exportFileName)
        ]}
      />
      {modal}
    </React.Fragment>
  );
};

const AsSubAccountsTable = SubAccountsTable(AuthenticatedBudgetSubAccountsTable);

export default React.memo(withContacts<R, M, AuthenticatedBudgetProps>(Columns)(AsSubAccountsTable));
