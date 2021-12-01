import React from "react";
import { map, filter } from "lodash";

import * as api from "api";
import { model, tabling, hooks } from "lib";

import { framework, WithConnectedTableProps } from "components/tabling/generic";
import { AuthenticatedModelTable, AuthenticatedModelTableProps } from "../ModelTable";
import { withContacts, WithWithContactsProps, WithContactsProps } from "../hocs";
import { useAttachments } from "../hooks";

import Framework from "./framework";
import Columns from "./Columns";

type R = Tables.ActualRowData;
type M = Model.Actual;

export type ActualsTableProps = Omit<AuthenticatedModelTableProps<R, M>, "columns"> &
  WithContactsProps & {
    readonly exportFileName: string;
    readonly actualTypes: Model.Tag[];
    readonly onAttachmentRemoved: (row: Table.ModelRow<R>, id: number) => void;
    readonly onAttachmentAdded: (row: Table.ModelRow<R>, attachment: Model.Attachment) => void;
    readonly onOwnersSearch: (value: string) => void;
  };

const ActualsTable = ({
  exportFileName,
  contacts,
  onOwnersSearch,
  onNewContact,
  onEditContact,
  onSearchContact,
  ...props
}: WithWithContactsProps<WithConnectedTableProps<ActualsTableProps, R, M>, R, M>): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined<R, M>(props.table);

  const [processAttachmentsCellForClipboard, processAttachmentsCellFromClipboard, setEditAttachments, modal] =
    useAttachments({
      table: table.current,
      onAttachmentRemoved: props.onAttachmentRemoved,
      onAttachmentAdded: props.onAttachmentAdded,
      listAttachments: api.getActualAttachments,
      deleteAttachment: api.deleteActualAttachment,
      path: (id: number) => `/v1/actuals/${id}/attachments/`
    });

  const processActualTypeCellFromClipboard = hooks.useDynamicCallback((name: string): Model.Tag | null =>
    model.util.inferModelFromName<Model.Tag>(props.actualTypes, name, { getName: (m: Model.Tag) => m.title })
  );

  const processOwnerCellFromClipboard = hooks.useDynamicCallback((value: string) => {
    if (value.trim() === "") {
      return null;
    }
    let availableOwners: (Model.SimpleSubAccount | Model.SimpleMarkup)[] = filter(
      map(
        filter(props.data, (r: Table.BodyRow<R>) => tabling.typeguards.isDataRow(r)),
        (row: Table.BodyRow<R>) => row.data.owner
      ),
      (owner: Model.SimpleSubAccount | Model.SimpleMarkup | null) => owner !== null
    ) as (Model.SimpleSubAccount | Model.SimpleMarkup)[];
    // If the user pastes the value after directly copying from an internal table,
    // the value will be structured as internal-<type>-<id> - which allows us to identify
    // which owner model the copy was performed on exactly, since `type` and `id` combine
    // to point to a unique model.
    if (value.startsWith("internal-")) {
      const splitValue = value.split("internal-")[1];
      if (splitValue.trim() === "") {
        return null;
      } else if (splitValue.split("-").length !== 2) {
        return null;
      } else {
        const type = splitValue.split("-")[0];
        const id = parseInt(splitValue.split("-")[1]);
        if (isNaN(id) || type.trim() === "") {
          return null;
        }
        const owner = filter(
          availableOwners,
          (o: Model.SimpleSubAccount | Model.SimpleMarkup) => o.id === id && o.type === type
        );
        if (owner.length === 0) {
          console.warn(`Could not parse Actual owner from clipboard value ${value}!`);
          return null;
        } else if (owner.length !== 1) {
          console.warn(`Parsed multiple Actual owners from clipboard value ${value}... returning first.`);
          return owner[0];
        }
        return owner[0];
      }
    } else {
      // If the user pastes the value in the cell from an external source, it will likely be just
      // the identifier - in which case we need to try to determine which owner that value for the
      // identifier refers to.
      availableOwners = filter(
        availableOwners,
        (o: Model.SimpleSubAccount | Model.SimpleMarkup) => o.identifier !== null
      );
      // NOTE: If there are multiple owners with the same identifier, this will
      // return the first and issue a warning.
      return model.util.inferModelFromName<Model.SimpleSubAccount | Model.SimpleMarkup>(availableOwners, value, {
        getName: (m: Model.SimpleSubAccount | Model.SimpleMarkup) => m.identifier
      });
    }
  });

  return (
    <React.Fragment>
      <AuthenticatedModelTable<R, M>
        {...props}
        table={table}
        showPageFooter={false}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        cookieNames={{ hiddenColumns: "actuals-table-hidden-columns" }}
        getModelRowName={(r: Table.ModelRow<R>) => r.data.name}
        getPlaceholderRowName={(r: Table.PlaceholderRow<R>) => r.data.name}
        getModelRowLabel={"Sub Account"}
        getPlaceholderRowLabel={"Sub Account"}
        framework={Framework}
        actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
          framework.actions.ToggleColumnAction(table.current, params),
          framework.actions.ExportCSVAction(table.current, params, exportFileName)
        ]}
        columns={tabling.columns.normalizeColumns<R, M>(props.columns, {
          owner: (col: Table.Column<R, M, Model.SimpleSubAccount | Model.SimpleMarkup | null>) => ({
            processCellFromClipboard: processOwnerCellFromClipboard,
            cellEditorParams: {
              ...col.cellEditorParams,
              setSearch: (value: string) => onOwnersSearch(value)
            }
          }),
          attachments: (col: Table.Column<R, M>) => ({
            onCellDoubleClicked: (row: Table.ModelRow<R>) => setEditAttachments(row.id),
            processCellFromClipboard: processAttachmentsCellFromClipboard,
            processCellForClipboard: processAttachmentsCellForClipboard,
            cellRendererParams: {
              ...col.cellRendererParams,
              onAttachmentAdded: props.onAttachmentAdded,
              uploadAttachmentsPath: (id: number) => `/v1/actuals/${id}/attachments/`
            }
          }),
          actual_type: {
            processCellFromClipboard: processActualTypeCellFromClipboard
          }
        })}
      />
      {modal}
    </React.Fragment>
  );
};

type ActualsTableType = {
  (props: WithConnectedTableProps<ActualsTableProps, R, M>): JSX.Element;
};

export default React.memo(
  withContacts<R, M, WithConnectedTableProps<ActualsTableProps, R, M>>(Columns)(ActualsTable)
) as ActualsTableType;
