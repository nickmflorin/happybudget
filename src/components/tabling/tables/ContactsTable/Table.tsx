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

const ContactsTable = ({ exportFileName, ...props }: WithConnectedTableProps<Props, R>): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined<R>(props.table);
  return (
    <AuthenticatedModelTable<R, M>
      {...props}
      table={table}
      showPageFooter={false}
      minimal={true}
      sizeToFit={true}
      cookieNames={{ hiddenColumns: "contacts-table-hidden-columns" }}
      leftAlignNewRowButton={true}
      indexColumnWidth={40}
      rowHeight={40}
      expandCellTooltip={"Edit"}
      getModelRowName={(r: Table.ModelRow<R>) =>
        util.conditionalJoinString(r.data.names_and_image.first_name, r.data.names_and_image.last_name)
      }
      getPlaceholderRowName={(r: Table.PlaceholderRow<R>) =>
        util.conditionalJoinString(r.data.names_and_image.first_name, r.data.names_and_image.last_name)
      }
      getModelRowLabel={"Contact"}
      getPlaceholderRowLabel={"Contact"}
      framework={Framework}
      actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
        framework.actions.ToggleColumnAction<R, M>(table.current, params),
        framework.actions.ExportCSVAction<R, M>(table.current, params, exportFileName)
      ]}
      columns={util.updateInArray<Table.Column<R, M>>(
        Columns,
        { field: "names_and_image" },
        {
          onCellDoubleClicked: (row: Table.BodyRow<R>) => tabling.typeguards.isModelRow(row) && props.onRowExpand?.(row)
        }
      )}
    />
  );
};

export default ContactsTable;
