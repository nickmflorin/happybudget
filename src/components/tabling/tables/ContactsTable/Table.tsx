import React from "react";

import * as api from "api";
import { tabling, util } from "lib";

import { framework, WithConnectedTableProps } from "components/tabling/generic";
import { AuthenticatedModelTable, AuthenticatedModelTableProps } from "../ModelTable";
import { useAttachments } from "../hooks";
import Framework from "./framework";
import Columns from "./Columns";

type R = Tables.ContactRowData;
type M = Model.Contact;

export type Props = Omit<AuthenticatedModelTableProps<R, M>, "columns"> & {
  readonly exportFileName: string;
  readonly onAttachmentRemoved: (row: Table.ModelRow<R>, id: number) => void;
  readonly onAttachmentAdded: (row: Table.ModelRow<R>, attachment: Model.Attachment) => void;
};

const ContactsTable = ({ exportFileName, ...props }: WithConnectedTableProps<Props, R, M>): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined<R, M>(props.table);

  const [processAttachmentsCellForClipboard, processAttachmentsCellFromClipboard, setEditAttachments, modal] =
    useAttachments({
      table: table.current,
      onAttachmentRemoved: props.onAttachmentRemoved,
      onAttachmentAdded: props.onAttachmentAdded,
      listAttachments: api.getContactAttachments,
      uploadAttachment: api.uploadContactAttachment,
      deleteAttachment: api.deleteContactAttachment,
      path: (id: number) => `/v1/contacts/${id}/attachments/`
    });

  return (
    <React.Fragment>
      <AuthenticatedModelTable<R, M>
        {...props}
        table={table}
        showPageFooter={false}
        minimal={true}
        cookieNames={{ hiddenColumns: "contacts-table-hidden-columns" }}
        leftAlignNewRowButton={true}
        indexColumnWidth={40}
        rowHeight={40}
        expandCellTooltip={"Edit"}
        getModelRowName={(r: Table.ModelRow<R>) => util.conditionalJoinString(r.data.first_name, r.data.last_name)}
        getPlaceholderRowName={(r: Table.PlaceholderRow<R>) =>
          util.conditionalJoinString(r.data.first_name, r.data.last_name)
        }
        getModelRowLabel={"Contact"}
        getPlaceholderRowLabel={"Contact"}
        framework={Framework}
        actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
          framework.actions.ToggleColumnAction<R, M>(table.current, params),
          framework.actions.ExportCSVAction<R, M>(table.current, params, exportFileName)
        ]}
        columns={tabling.columns.normalizeColumns<R, M>(Columns, {
          attachments: {
            onCellDoubleClicked: (row: Table.ModelRow<R>) => setEditAttachments(row.id),
            processCellForClipboard: processAttachmentsCellForClipboard,
            processCellFromClipboard: processAttachmentsCellFromClipboard
          }
        })}
      />
      {modal}
    </React.Fragment>
  );
};

export default ContactsTable;
