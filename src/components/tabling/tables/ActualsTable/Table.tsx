import React, { useState } from "react";
import { map, filter, find, isNil } from "lodash";

import { model, tabling, hooks } from "lib";

import { EditActualAttachmentsModal } from "components/modals";
import { framework, WithConnectedTableProps } from "components/tabling/generic";
import { AuthenticatedModelTable, AuthenticatedModelTableProps } from "../ModelTable";
import Framework from "./framework";
import Columns from "./Columns";

type R = Tables.ActualRowData;
type M = Model.Actual;

export type ActualsTableProps = Omit<AuthenticatedModelTableProps<R, M>, "columns"> & {
  readonly exportFileName: string;
  readonly contacts: Model.Contact[];
  readonly actualTypes: Model.Tag[];
  readonly onAttachmentAdded: (row: Table.ModelRow<R>, attachment: Model.Attachment) => void;
  readonly onOwnerTreeSearch: (value: string) => void;
  readonly onNewContact: (params: { name?: string; id: Table.ModelRowId }) => void;
  readonly onEditContact: (params: { contact: number; id: Table.EditableRowId }) => void;
};

const ActualsTable = ({
  exportFileName,
  contacts,
  onOwnerTreeSearch,
  onNewContact,
  onEditContact,
  ...props
}: WithConnectedTableProps<ActualsTableProps, R, M>): JSX.Element => {
  const [editSubAccountAttachments, setEditSubAccountAttachments] = useState<number | null>(null);
  const table = tabling.hooks.useTableIfNotDefined<R, M>(props.table);

  const processActualTypeCellFromClipboard = hooks.useDynamicCallback((name: string): Model.Tag | null =>
    model.util.inferModelFromName<Model.Tag>(props.actualTypes, name, { nameField: "title" })
  );

  const processContactCellForClipboard = hooks.useDynamicCallback((row: R) => {
    const id = row.contact;
    if (isNil(id)) {
      return "";
    }
    const m: Model.Contact | undefined = find(contacts, { id } as any);
    return m?.full_name || "";
  });

  const processContactCellFromClipboard = hooks.useDynamicCallback((name: string) => {
    if (name.trim() === "") {
      return null;
    } else {
      const names = model.util.parseFirstAndLastName(name);
      const contact: Model.Contact | undefined = find(contacts, {
        first_name: names[0],
        last_name: names[1]
      });
      return contact?.id || null;
    }
  });

  const processOwnerCellFromClipboard = hooks.useDynamicCallback((name: string) => {
    if (name.trim() === "") {
      return null;
    }
    const availableOwners: (Model.SimpleSubAccount | Model.SimpleMarkup)[] = filter(
      map(
        filter(props.data, (r: Table.BodyRow<R>) => tabling.typeguards.isDataRow(r)),
        (row: Table.BodyRow<R>) => row.data.owner
      ),
      (owner: Model.SimpleSubAccount | Model.SimpleMarkup | null) => owner !== null && owner.identifier !== null
    ) as Model.SimpleSubAccount[];
    // NOTE: If there are multiple owners with the same identifier, this will
    // return the first and issue a warning.
    const subaccount = model.util.inferModelFromName<Model.SimpleSubAccount | Model.SimpleMarkup>(
      availableOwners,
      name,
      { nameField: "identifier" }
    );
    return subaccount;
  });

  return (
    <React.Fragment>
      <AuthenticatedModelTable<R, M>
        {...props}
        table={table}
        showPageFooter={false}
        menuPortalId={"supplementary-header"}
        cookieNames={{ hiddenColumns: "actuals-table-hidden-columns" }}
        getModelRowName={(r: Table.ModelRow<R>) => r.data.description}
        getPlaceholderRowName={(r: Table.PlaceholderRow<R>) => r.data.description}
        getModelRowLabel={"Sub Account"}
        getPlaceholderRowLabel={"Sub Account"}
        framework={Framework}
        actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
          framework.actions.ToggleColumnAction(table.current, params),
          framework.actions.ExportCSVAction(table.current, params, exportFileName)
        ]}
        columns={tabling.columns.normalizeColumns<R, M>(Columns, {
          owner: (col: Table.Column<R, M, Model.SimpleSubAccount | Model.SimpleMarkup | null>) => ({
            processCellFromClipboard: processOwnerCellFromClipboard,
            cellEditorParams: {
              ...col.cellEditorParams,
              setSearch: (value: string) => onOwnerTreeSearch(value)
            }
          }),
          attachments: {
            onCellDoubleClicked: (row: Table.ModelRow<R>) => setEditSubAccountAttachments(row.id)
          },
          actual_type: {
            processCellFromClipboard: processActualTypeCellFromClipboard
          },
          contact: {
            cellRendererParams: { onEditContact },
            cellEditorParams: { onNewContact },
            processCellForClipboard: processContactCellForClipboard,
            processCellFromClipboard: processContactCellFromClipboard
          }
        })}
      />
      {!isNil(editSubAccountAttachments) && (
        <EditActualAttachmentsModal
          id={editSubAccountAttachments}
          open={true}
          onCancel={() => setEditSubAccountAttachments(null)}
          onAttachmentAdded={(m: Model.Attachment) => {
            const row = table.current.getRow(editSubAccountAttachments);
            if (!isNil(row)) {
              if (tabling.typeguards.isModelRow(row)) {
                props.onAttachmentAdded(row, m);
              } else {
                console.warn(
                  `Suspicous Behavior: After attachment was added, row with ID
                  ${editSubAccountAttachments} did not refer to a model row.`
                );
              }
            } else {
              console.warn(
                `Suspicous Behavior: After attachment was added, could not find row in
                state for ID ${editSubAccountAttachments}.`
              );
            }
          }}
        />
      )}
    </React.Fragment>
  );
};

export default ActualsTable;
