import React, { useMemo } from "react";
import { Dispatch } from "redux";
import { useDispatch, useSelector } from "react-redux";
import { isNil, find } from "lodash";

import * as api from "api";
import { actions } from "store";
import { tabling, hooks } from "lib";
import { framework } from "tabling/generic";

import { selectors } from "app/Budgeting/store";
import { CreateContactParams, EditContactParams } from "components/hooks";
import { useAttachments, useContacts } from "../hooks";
import AuthenticatedTable, { AuthenticatedTableProps } from "./AuthenticatedTable";
import Columns from "./Columns";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

export type AuthenticatedBudgetProps<P extends Model.Account | Model.SubAccount> = Omit<
  AuthenticatedTableProps<Model.Budget, P>,
  "domain" | "onCellFocusChanged" | "columns"
> & {
  readonly onAttachmentRemoved: (row: Table.ModelRow<R>, id: number) => void;
  readonly onAttachmentAdded: (row: Table.ModelRow<R>, attachment: Model.Attachment) => void;
  readonly onExportPdf: () => void;
  readonly onShared: (token: Model.PublicToken) => void;
  readonly onShareUpdated: (token: Model.PublicToken) => void;
  readonly onUnshared: () => void;
  readonly onParentUpdated: (p: P) => void;
  readonly onBudgetUpdated: (m: Model.Budget) => void;
};

const AuthenticatedBudget = <P extends Model.Account | Model.SubAccount>(
  props: AuthenticatedBudgetProps<P>
): JSX.Element => {
  const budget: Model.Budget | null = useSelector(
    (s: Application.Store) =>
      selectors.selectBudgetDetail(s, { domain: "budget", public: false }) as Model.Budget | null
  );

  const dispatch: Dispatch = useDispatch();

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [
    processAttachmentsCellForClipboard,
    processAttachmentsCellFromClipboard,
    setEditAttachments,
    attachmentsModal
  ] = useAttachments({
    table: props.table.current,
    onAttachmentRemoved: props.onAttachmentRemoved,
    onAttachmentAdded: props.onAttachmentAdded,
    listAttachments: api.getSubAccountAttachments,
    deleteAttachment: api.deleteSubAccountAttachment,
    path: (id: number) => `/v1/subaccounts/${id}/attachments/`
  });

  const onContactCreated = useMemo(
    () => (m: Model.Contact, params?: CreateContactParams) => {
      dispatch(actions.authenticated.addContactToStateAction(m));
      /* If we have enough information from before the contact was created in
			   the specific cell, combine that information with the new value to
				 perform a table update, showing the created contact in the new cell. */
      const rowId = params?.rowId;
      if (!isNil(rowId)) {
        const row: Table.BodyRow<R> | null = props.table.current.getRow(rowId);
        if (!isNil(row) && tabling.typeguards.isModelRow(row)) {
          let rowChange: Table.RowChange<R, Table.ModelRow<R>> = {
            id: row.id,
            data: { contact: { oldValue: row.data.contact || null, newValue: m.id } }
          };
          /* If the Row does not already specify a rate and the Contact does
						 specify a rate, use the rate that is specified for the Contact. */
          if (m.rate !== null && row.data.rate === null) {
            rowChange = {
              ...rowChange,
              data: { ...rowChange.data, rate: { oldValue: row.data.rate, newValue: m.rate } }
            };
          }
          props.table.current.applyTableChange({
            type: "dataChange",
            payload: rowChange
          });
        }
      }
    },
    [props.table.current]
  );

  const onContactUpdated = useMemo(
    () => (m: Model.Contact, params: EditContactParams) => {
      dispatch(actions.authenticated.updateContactInStateAction({ id: m.id, data: m }));
      const rowId = params.rowId;
      if (!isNil(rowId)) {
        const row: Table.BodyRow<R> | null = props.table.current.getRow(rowId);
        if (!isNil(row) && tabling.typeguards.isModelRow(row) && row.data.rate === null && m.rate !== null) {
          props.table.current.applyTableChange({
            type: "dataChange",
            payload: {
              id: row.id,
              data: { rate: { oldValue: row.data.rate, newValue: m.rate } }
            }
          });
        }
      }
    },
    [props.table.current]
  );

  const {
    modals,
    data: contacts,
    columns: columnsWithContacts,
    onCellFocusChanged
  } = useContacts({
    table: props.table,
    columns: Columns,
    onCreated: onContactCreated,
    onUpdated: onContactUpdated
  });

  const columns = useMemo(
    () =>
      tabling.columns.normalizeColumns(columnsWithContacts, {
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
        contact: {
          onDataChange: (id: Table.ModelRowId, change: Table.CellChange) => {
            /* If the Row does not already have a populated value for `rate`,
						   we populate the `rate` value based on the selected Contact
						   (if non-null). */
            if (change.newValue !== null) {
              const row = props.table.current.getRow(id);
              if (!isNil(row) && tabling.typeguards.isModelRow(row) && row.data.rate === null) {
                const contact: Model.Contact | undefined = find(contacts, { id: change.newValue });
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
      }),
    [
      hooks.useDeepEqualMemo(columnsWithContacts),
      props.onAttachmentAdded,
      processAttachmentsCellFromClipboard,
      processAttachmentsCellForClipboard
    ]
  );

  const tableActions = useMemo(
    () => (params: Table.AuthenticatedMenuActionParams<R, M>) => {
      let _actions: Table.AuthenticatedMenuActions<R, M> = [
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ExportPdfAction(props.onExportPdf)
      ];
      if (!isNil(budget)) {
        _actions = [
          ..._actions,
          framework.actions.ShareAction<Model.Budget>({
            instance: budget,
            create: api.createBudgetPublicToken,
            onCreated: (token: Model.PublicToken) => props.onShared(token),
            onUpdated: (token: Model.PublicToken) => props.onShareUpdated(token),
            onDeleted: () => props.onUnshared()
          })
        ];
      }
      return _actions;
    },
    [budget, props.actions, props.onShared]
  );

  return (
    <React.Fragment>
      <AuthenticatedTable
        {...props}
        domain={"budget"}
        onCellFocusChanged={onCellFocusChanged}
        columns={columns}
        actions={tableActions}
      />
      {attachmentsModal}
      {modals}
    </React.Fragment>
  );
};

export default AuthenticatedBudget;
