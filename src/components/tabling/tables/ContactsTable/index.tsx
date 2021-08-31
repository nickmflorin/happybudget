import { model, tabling } from "lib";

import { framework } from "components/tabling/generic";
import { ReadWriteModelTable, ReadWriteModelTableProps } from "../ModelTable";
import Framework from "./framework";

type R = Tables.ContactRow;
type M = Model.Contact;

type OmitTableProps = "columns" | "getRowLabel" | "actions" | "showPageFooter";

export interface ContactsTableProps extends Omit<ReadWriteModelTableProps<R, M>, OmitTableProps> {
  readonly exportFileName: string;
  readonly cookieNames?: Omit<Table.CookieNames, "hiddenColumns">;
  readonly onEditContact: (id: number) => void;
}

const ContactsTable = ({ exportFileName, onEditContact, ...props }: ContactsTableProps): JSX.Element => {
  const tableRef = tabling.hooks.useReadWriteTableIfNotDefined<R, M>(props.tableRef);
  return (
    <ReadWriteModelTable<R, M>
      {...props}
      defaultRowLabel={"Contact"}
      showPageFooter={false}
      tableRef={tableRef}
      minimal={true}
      cookieNames={{ ...props.cookieNames, hiddenColumns: "contacts-table-hidden-columns" }}
      leftAlignNewRowButton={true}
      indexColumnWidth={40}
      getRowLabel={(m: M) => m.full_name}
      framework={Framework}
      onRowExpand={(id: number) => onEditContact(id)}
      expandCellTooltip={"Edit"}
      rowHeight={36}
      actions={(params: Table.ReadWriteMenuActionParams<R, M>) => [
        framework.actions.ToggleColumnAction(tableRef.current, params),
        framework.actions.ExportCSVAction(tableRef.current, params, exportFileName)
      ]}
      columns={[
        framework.columnObjs.BodyColumn({
          field: "names_and_image",
          headerName: "Name",
          columnType: "text",
          cellRenderer: "ContactNameCell",
          editable: false,
          cellClass: "cell--renders-html",
          getRowValue: (m: Model.Contact) => ({ image: m.image, first_name: m.first_name, last_name: m.last_name }),
          onCellDoubleClicked: (row: Tables.ContactRow) => onEditContact(row.id)
        }),
        framework.columnObjs.ChoiceSelectColumn<R, M, Model.ContactType>({
          field: "type",
          headerName: "Type",
          defaultHidden: true,
          cellRenderer: { data: "ContactTypeCell" },
          cellEditor: "ContactTypeEditor",
          models: model.models.ContactTypes
        }),
        framework.columnObjs.BodyColumn({
          field: "company",
          headerName: "Company",
          columnType: "text"
        }),
        framework.columnObjs.BodyColumn({
          field: "position",
          headerName: "Position",
          columnType: "text"
        }),
        framework.columnObjs.BodyColumn({
          field: "phone_number",
          headerName: "Phone Number",
          columnType: "phone",
          cellRenderer: { data: "PhoneNumberCell" }
        }),
        framework.columnObjs.BodyColumn({
          field: "email",
          headerName: "Email",
          columnType: "email",
          cellRenderer: { data: "EmailCell" },
          valueSetter: tabling.valueSetters.emailValueSetter<R>("email")
        })
      ]}
    />
  );
};

export default ContactsTable;
