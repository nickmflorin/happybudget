import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { map, filter, isNil } from "lodash";

import * as api from "api";
import { Config } from "config";
import { model, tabling, hooks } from "lib";
import * as store from "store";

import { CreateContactParams } from "components/model/hooks";
import { ImportActualsPlaidModal } from "components/modals";
import { usePlaid, UsePlaidSuccessParams } from "components/integrations";

import { framework as genericFramework } from "tabling/generic";
import { AuthenticatedTable, AuthenticatedTableProps } from "tabling/generic/tables";
import { useAttachments, useContacts } from "../hooks";

import * as framework from "./framework";
import Columns from "./Columns";

type OmitProps =
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
  | "onCellFocusChanged"
  | "columns";

type R = Tables.ActualRowData;
type M = Model.Actual;
type S = Tables.ActualTableStore;

export type Props = Omit<AuthenticatedTableProps<R, M, S>, OmitProps> & {
  readonly parent: Model.Budget | null;
  readonly data: Table.BodyRow<R>[];
  readonly actionContext: Tables.ActualTableContext;
  readonly actualTypes: Model.Tag[];
  readonly onOwnersSearch: (value: string) => void;
  readonly onExportPdf: () => void;
  readonly onImportSuccess: (b: Model.Budget, ms: Model.Actual[]) => void;
};

const ActualsTable = ({ parent, onOwnersSearch, onImportSuccess, ...props }: Props): JSX.Element => {
  const dispatch: Dispatch = useDispatch();
  const [plaidSuccessParams, setPlaidSuccessParams] = useState<UsePlaidSuccessParams | null>(null);

  const { open } = usePlaid({
    onSuccess: (p: UsePlaidSuccessParams) => setPlaidSuccessParams(p),
    onError: (e: string) =>
      props.table.current.notify({
        message: "There was an error connecting to Plaid.",
        detail: e,
        level: "error",
        duration: 3000,
        closable: true
      })
  });

  const [
    processAttachmentsCellForClipboard,
    processAttachmentsCellFromClipboard,
    setEditAttachments,
    modal,
    addAttachment,
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    removeAttachment
  ] = useAttachments({
    table: props.table.current,
    listAttachments: api.getActualAttachments,
    deleteAttachment: api.deleteActualAttachment,
    path: (id: number) => `/v1/actuals/${id}/attachments/`
  });

  const processActualTypeCellFromClipboard = hooks.useDynamicCallback((name: string): Model.Tag | null =>
    model.inferModelFromName<Model.Tag>(props.actualTypes, name, {
      getName: (m: Model.Tag) => m.title,
      warnOnMissing: false
    })
  );

  const processOwnerCellFromClipboard = hooks.useDynamicCallback((value: string) => {
    if (value.trim() === "") {
      return null;
    }
    let availableOwners: (Model.SimpleSubAccount | Model.SimpleMarkup)[] = filter(
      map(
        filter(props.data, (r: Table.BodyRow<R>) => tabling.rows.isDataRow(r)) as Table.DataRow<R>[],
        (row: Table.DataRow<R>) => row.data.owner
      ),
      (owner: Model.SimpleSubAccount | Model.SimpleMarkup | null) => owner !== null
    ) as (Model.SimpleSubAccount | Model.SimpleMarkup)[];
    /* If the user pastes the value after directly copying from an internal
			 table, the value will be structured as internal-<type>-<id> - which allows
			 us to identify which owner model the copy was performed on exactly,
			 since `type` and `id` combine to point to a unique model. */
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
      /* If the user pastes the value in the cell from an external source, it
			   will likely be just the identifier - in which case we need to try to
				 determine which owner that value for the identifier refers to. */
      availableOwners = filter(
        availableOwners,
        (o: Model.SimpleSubAccount | Model.SimpleMarkup) => o.identifier !== null
      );
      /* NOTE: If there are multiple owners with the same identifier, this will
         return the first and issue a warning. */
      return model.inferModelFromName<Model.SimpleSubAccount | Model.SimpleMarkup>(availableOwners, value, {
        getName: (m: Model.SimpleSubAccount | Model.SimpleMarkup) => m.identifier
      });
    }
  });

  const onContactCreated = useMemo(
    () => (m: Model.Contact, params?: CreateContactParams) => {
      dispatch(store.actions.addContactToStateAction(m));
      /* If we have enough information from before the contact was created in
				 the specific cell, combine that information with the new value to
				 perform a table update, showing the created contact in the new cell. */
      const rowId = params?.rowId;
      if (!isNil(rowId)) {
        const row: Table.BodyRow<R> | null = props.table.current.getRow(rowId);
        if (!isNil(row) && tabling.rows.isModelRow(row)) {
          const rowChange: Table.RowChange<R> = {
            id: row.id,
            data: { contact: { oldValue: row.data.contact, newValue: m.id } }
          };
          props.table.current.dispatchEvent({
            type: "dataChange",
            payload: rowChange
          });
        }
      }
    },
    [props.table.current]
  );

  const {
    modals: contactModals,
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    data: cs,
    columns: columnsWithContacts,
    onCellFocusChanged
  } = useContacts({
    table: props.table,
    columns: Columns,
    onCreated: onContactCreated
  });

  const columns = useMemo(
    () =>
      tabling.columns.normalizeColumns(columnsWithContacts, {
        owner: (col: Table.Column<R, M>) => ({
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
            onAttachmentAdded: addAttachment,
            uploadAttachmentsPath: (id: number) => `/v1/actuals/${id}/attachments/`
          }
        }),
        actual_type: {
          processCellFromClipboard: processActualTypeCellFromClipboard
        }
      }),
    [
      hooks.useDeepEqualMemo(columnsWithContacts),
      processActualTypeCellFromClipboard,
      addAttachment,
      processAttachmentsCellForClipboard,
      processActualTypeCellFromClipboard
    ]
  );

  return (
    <React.Fragment>
      <AuthenticatedTable
        {...props}
        tableId={"budget-actuals"}
        columns={columns}
        onCellFocusChanged={onCellFocusChanged}
        showPageFooter={false}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        getModelRowName={(r: Table.DataRow<R>) => r.data.name}
        getModelRowLabel={"Actual"}
        framework={framework.FrameworkComponents}
        actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
          genericFramework.actions.ToggleColumnAction(props.table.current, params),
          framework.actions.ImportActualsAction({
            table: props.table.current,
            onLinkToken: (linkToken: string) => open(linkToken)
          }),
          genericFramework.actions.ExportPdfAction(props.onExportPdf)
        ]}
      />
      {modal}
      {contactModals}
      {!isNil(parent) && !isNil(plaidSuccessParams) && (
        <ImportActualsPlaidModal
          open={true}
          onCancel={() => setPlaidSuccessParams(null)}
          publicToken={plaidSuccessParams.publicToken}
          budgetId={parent.id}
          accountIds={plaidSuccessParams.accountIds}
          onSuccess={(b: Model.Budget, ms: Model.Actual[]) => {
            setPlaidSuccessParams(null);
            onImportSuccess(b, ms);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default React.memo(ActualsTable);
