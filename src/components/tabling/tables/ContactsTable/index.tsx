import { model, tabling } from "lib";

import { ModelTable, ModelTableProps } from "components/tabling";
import { framework } from "components/tabling/generic";

import Framework from "./framework";

type R = Tables.ContactRow;
type M = Model.Contact;

type OmitTableProps = "columns" | "getRowLabel" | "actions" | "showPageFooter";

export interface ContactsTableProps extends Omit<ModelTableProps<R, M>, OmitTableProps> {
  readonly exportFileName: string;
  readonly onEditContact: (id: number) => void;
}

const ContactsTable = ({ exportFileName, onEditContact, ...props }: ContactsTableProps): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined<R, M>(props.table);
  return (
    <ModelTable<R, M>
      {...props}
      defaultRowLabel={"Contact"}
      showPageFooter={false}
      table={table}
      minimal={true}
      leftAlignNewRowButton={true}
      indexColumnWidth={40}
      getRowLabel={(m: M) => m.full_name}
      framework={tabling.util.combineFrameworks(Framework, props.framework)}
      onRowExpand={(id: number) => onEditContact(id)}
      expandCellTooltip={"Edit"}
      rowHeight={52}
      actions={(params: Table.MenuActionParams<R, M>) => [
        {
          tooltip: "Delete",
          icon: "trash-alt",
          disabled: params.selectedRows.length === 0,
          onClick: () => {
            const rows: R[] = params.apis.grid.getSelectedRows();
            props.onChangeEvent?.({
              payload: { rows, columns: params.columns },
              type: "rowDelete"
            });
          }
        },
        framework.actions.ToggleColumnAction(table.current, params),
        framework.actions.ExportCSVAction(table.current, params, exportFileName)
      ]}
      columns={[
        {
          field: "names_and_image",
          headerName: "Name",
          columnType: "text",
          cellRenderer: "ContactNameCell",
          editable: false,
          cellClass: "cell--renders-html",
          getRowValue: (m: Model.Contact) => ({ image: m.image, first_name: m.first_name, last_name: m.last_name }),
          onCellDoubleClicked: (row: Tables.ContactRow) => onEditContact(row.id)
        },
        framework.columnObjs.ChoiceSelectColumn<R, M, Model.ContactType>({
          field: "type",
          headerName: "Type",
          cellRenderer: { data: "ContactTypeCell" },
          cellEditor: "ContactTypeEditor",
          models: model.models.ContactTypes
        }),
        {
          field: "company",
          headerName: "Company",
          columnType: "text"
        },
        {
          field: "position",
          headerName: "Position",
          columnType: "text"
        },
        {
          field: "phone_number",
          headerName: "Phone Number",
          columnType: "phoneNumber",
          cellRenderer: { data: "PhoneNumberCell" }
        },
        {
          field: "email",
          headerName: "Email",
          columnType: "email",
          cellRenderer: { data: "EmailCell" },
          valueSetter: tabling.valueSetters.emailValueSetter<R>("email")
        }
      ]}
    />
  );
};

export default ContactsTable;
