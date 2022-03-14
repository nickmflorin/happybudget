import React, { useMemo } from "react";
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import { isNil, find } from "lodash";

import { actions } from "store";
import { models, tabling, hooks, contacts } from "lib";
import { useContacts as useContactsComponents, EditContactParams, CreateContactParams } from "components/hooks";

type UseContactsReturnType<
  R extends Tables.ActualRowData | Tables.SubAccountRowData | Tables.ContactRowData,
  M extends Model.Actual | Model.SubAccount
> = {
  readonly data: Model.Contact[];
  readonly modals: JSX.Element;
  readonly columns: Table.Column<R, M>[];
  readonly onCellFocusChanged: (params: Table.CellFocusChangedParams<R, M>) => void;
};

type UseContactsProps<
  R extends Tables.ActualRowData | Tables.SubAccountRowData,
  M extends Model.Actual | Model.SubAccount
> = {
  readonly table: NonNullRef<Table.TableInstance<R, M>>;
  readonly columns: Table.Column<R, M>[];
  readonly onAttachmentRemoved?: (id: number, attachmentId: number) => void;
  readonly onAttachmentAdded?: (id: number, m: Model.Attachment) => void;
  readonly onCreated: (m: Model.Contact, p?: CreateContactParams) => void;
  readonly onUpdated?: (m: Model.Contact, p: EditContactParams) => void;
};

const useContacts = <
  R extends Tables.ActualRowData | Tables.SubAccountRowData,
  M extends Model.Actual | Model.SubAccount
>(
  props: UseContactsProps<R, M>
): UseContactsReturnType<R, M> => {
  const cs = contacts.hooks.useContacts();
  const dispatch: Dispatch = useDispatch();

  const processCellForClipboard = hooks.useDynamicCallback((row: R) => {
    const id = row.contact;
    if (isNil(id)) {
      return "";
    }
    const m = models.getModel(cs, id, { modelName: "contact" });
    return m?.full_name || "";
  });

  const processCellForCSV = hooks.useDynamicCallback((row: R) => {
    if (!isNil(row.contact)) {
      const m: Model.Contact | null = models.getModel(cs, row.contact);
      return (!isNil(m) && contacts.models.contactName(m)) || "";
    }
    return "";
  });

  const processCellFromClipboard = hooks.useDynamicCallback((name: string) => {
    if (name.trim() === "") {
      return null;
    } else {
      const names = models.parseFirstAndLastName(name);
      const contact: Model.Contact | undefined = find(cs, {
        first_name: names[0],
        last_name: names[1]
      });
      return contact?.id || null;
    }
  });

  const [createContactModal, editContactModal, editContact, createContact] = useContactsComponents(props);

  const columns = useMemo(
    () =>
      tabling.columns.normalizeColumns(props.columns, {
        contact: {
          processCellForClipboard,
          processCellForCSV,
          cellRendererParams: {
            onEditContact: (params: { contact: number; rowId: Table.ModelRowId }) =>
              editContact({ id: params.contact, rowId: params.rowId })
          },
          cellEditorParams: {
            onNewContact: (params: { name?: string; rowId: Table.ModelRowId }) => createContact(params),
            setSearch: (v: string) => dispatch(actions.authenticated.setContactsSearchAction(v, {}))
          },
          processCellFromClipboard
        }
      }),
    [hooks.useDeepEqualMemo(cs), editContact]
  );

  const onCellFocusChanged = hooks.useDynamicCallback((params: Table.CellFocusChangedParams<R, M>) => {
    /*
			For the ContactCell, we want the contact tag in the cell to be
			clickable only when the cell is focused.  This means we have to
			rerender the cell when it becomes focused or unfocused so that the
			tag becomes clickable (in the focused case) or unclickable (in the
			unfocused case).
			*/
    const rowNodes: Table.RowNode[] = [];
    if (tabling.columns.isBodyColumn(params.cell.column) && params.cell.column.field === "contact") {
      rowNodes.push(params.cell.rowNode);
    }
    if (
      !isNil(params.previousCell) &&
      tabling.columns.isBodyColumn(params.previousCell.column) &&
      params.previousCell.column.field === "contact"
    ) {
      rowNodes.push(params.previousCell.rowNode);
    }
    if (rowNodes.length !== 0) {
      params.apis.grid.refreshCells({
        force: true,
        rowNodes,
        columns: ["contact"]
      });
    }
  });

  return {
    modals: (
      <React.Fragment>
        {createContactModal}
        {editContactModal}
      </React.Fragment>
    ),
    data: cs,
    onCellFocusChanged,
    columns
  };
};

export default useContacts;
