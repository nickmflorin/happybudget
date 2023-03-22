import React from "react";

import { isNil } from "lodash";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";

import * as api from "api";
import { logger } from "internal";
import { tabling, conditionalJoinString } from "lib";
import { hooks } from "components/model";
import { framework } from "components/tabling/generic";
import { AuthenticatedTable, AuthenticatedTableProps } from "components/tabling/generic/tables";
import * as store from "application/store";

import { useAttachments } from "../hooks";

import Columns from "./Columns";
import Framework from "./framework";

type R = Tables.ContactRowData;
type M = Model.Contact;

type OmitProps =
  | "tableContext"
  | "showPageFooter"
  | "pinFirstColumn"
  | "tableId"
  | "menuPortalId"
  | "savingChangesPortalId"
  | "framework"
  | "getModelRowName"
  | "getMarkupRowName"
  | "getModelRowLabel"
  | "getMarkupRowLabel"
  | "onGroupRows"
  | "onMarkupRows"
  | "onEditMarkup"
  | "onEditGroup"
  | "columns";

export type Props = Omit<AuthenticatedTableProps<R, M>, OmitProps>;

const ContactsTable = (props: Props): JSX.Element => {
  const dispatch: Dispatch = useDispatch();

  const [
    processAttachmentsCellForClipboard,
    processAttachmentsCellFromClipboard,
    setEditAttachments,
    modal,
    addAttachment,
    removeAttachment,
  ] = useAttachments({
    table: props.table.current,
    listAttachments: api.getContactAttachments,
    deleteAttachment: api.deleteContactAttachment,
    path: (id: number) => `/v1/contacts/${id}/attachments/`,
  });

  const [__, editContactModal, editContact, _] = hooks.useContacts({
    onCreated: (m: Model.Contact) => dispatch(store.actions.addContactToStateAction(m, {})),
    onUpdated: (m: Model.Contact) =>
      props.table.current.dispatchEvent({
        type: "modelsUpdated",
        payload: { model: m },
      }),
    onAttachmentRemoved: (id: number, attachmentId: number) => {
      const row = props.table.current.getRow(id);
      if (!isNil(row)) {
        if (tabling.rows.isModelRow(row)) {
          removeAttachment(row, attachmentId);
        } else {
          logger.warn(
            `Suspicous Behavior: After attachment was added, row with ID ${id} did not refer to a model row.`,
          );
        }
      } else {
        logger.warn(
          `Suspicous Behavior: After attachment was added, could not find row in state for ID ${id}.`,
        );
      }
    },
    onAttachmentAdded: (id: number, m: Model.Attachment) => {
      const row = props.table.current.getRow(id);
      if (!isNil(row)) {
        if (tabling.rows.isModelRow(row)) {
          addAttachment(row, m);
        } else {
          logger.warn(
            `Suspicous Behavior: After attachment was added, row with ID ${id} did not refer to a model row.`,
          );
        }
      } else {
        logger.warn(
          `Suspicous Behavior: After attachment was added, could not find row in state for ID ${id}.`,
        );
      }
    },
  });

  return (
    <React.Fragment>
      <AuthenticatedTable<R, M, Table.Context, Tables.ContactTableStore>
        {...props}
        tableId="contacts"
        tableContext={{}}
        showPageFooter={false}
        minimal={true}
        rowHeight={40}
        sizeToFit={true}
        constrainTableFooterHorizontally={true}
        getModelRowName={(r: Table.DataRow<R>) =>
          conditionalJoinString(r.data.first_name, r.data.last_name)
        }
        getModelRowLabel="Contact"
        framework={Framework}
        editColumnConfig={
          [
            {
              typeguard: tabling.rows.isModelRow,
              action: (r: Table.ModelRow<R>) => editContact({ id: r.id, rowId: r.id }),
              behavior: "expand",
              tooltip: "Edit",
            },
          ] as [Table.EditColumnRowConfig<R, Table.ModelRow<R>>]
        }
        actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
          framework.actions.ToggleColumnAction<R, M>(props.table.current, params),
          framework.actions.ExportCSVAction<R, M>(props.table.current, params, "contacts"),
        ]}
        columns={tabling.columns.normalizeColumns(Columns, {
          attachments: (col: Table.Column<R, M>) => ({
            onCellDoubleClicked: (row: Table.ModelRow<R>) => setEditAttachments(row.id),
            processCellFromClipboard: processAttachmentsCellFromClipboard,
            processCellForClipboard: processAttachmentsCellForClipboard,
            cellRendererParams: {
              ...col.cellRendererParams,
              onAttachmentAdded: addAttachment,
              uploadAttachmentsPath: (id: number) => `/v1/contacts/${id}/attachments/`,
            },
          }),
        })}
      />
      {modal}
      {editContactModal}
    </React.Fragment>
  );
};

export default React.memo(ContactsTable);
