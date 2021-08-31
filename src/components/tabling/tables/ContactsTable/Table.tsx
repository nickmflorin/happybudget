import { tabling, util } from "lib";

import { framework, WithConnectedTableProps } from "components/tabling/generic";
import { AuthenticatedModelTable, AuthenticatedModelTableProps } from "../ModelTable";
import Framework from "./framework";
import Columns from "./Columns";

type R = Tables.ContactRowData;
type M = Model.Contact;

export type Props = Omit<AuthenticatedModelTableProps<R, M>, "columns"> & {
  readonly exportFileName: string;
};

const ContactsTable = ({ exportFileName, ...props }: WithConnectedTableProps<Props, R, M>): JSX.Element => {
  const tableRef = tabling.hooks.useAuthenticatedTableIfNotDefined<R>(props.tableRef);
  return (
    <AuthenticatedModelTable<R, M>
      {...props}
      tableRef={tableRef}
      showPageFooter={false}
      defaultRowLabel={"Contact"}
      minimal={true}
      cookieNames={{ hiddenColumns: "contacts-table-hidden-columns" }}
      leftAlignNewRowButton={true}
      indexColumnWidth={40}
      rowHeight={40}
      expandCellTooltip={"Edit"}
      framework={Framework}
      actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
        framework.actions.ToggleColumnAction<R, M>(tableRef.current, params),
        framework.actions.ExportCSVAction<R, M>(tableRef.current, params, exportFileName)
      ]}
      columns={util.updateInArray<Table.Column<R, M>>(
        Columns,
        { field: "names_and_image" },
        {
          onCellDoubleClicked: (row: Table.Row<R, M>) => tabling.typeguards.isModelRow(row) && props.onRowExpand?.(row)
        }
      )}
    />
  );
};

export default ContactsTable;
