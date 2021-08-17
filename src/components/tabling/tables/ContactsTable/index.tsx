import { isNil } from "lodash";

import { faTrashAlt } from "@fortawesome/pro-regular-svg-icons";

import { SuppressKeyboardEventParams } from "@ag-grid-community/core";

import { model, util, tabling } from "lib";

import { ModelTable, ModelTableProps } from "components/tabling";
import { framework } from "components/tabling/generic";

import Framework from "./framework";

type R = Tables.ContactRow;
type M = Model.Contact;

type OmitTableProps = "columns" | "getModelLabel" | "actions" | "showPageFooter";

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
      getModelLabel={(m: M) => m.full_name}
      framework={tabling.util.combineFrameworks(Framework, props.framework)}
      onRowExpand={(id: number) => onEditContact(id)}
      expandCellTooltip={"Edit"}
      actions={(params: Table.MenuActionParams<R, M>) => [
        {
          tooltip: "Delete",
          icon: faTrashAlt,
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
          field: "first_name",
          headerName: "First Name",
          columnType: "text"
        },
        {
          field: "last_name",
          headerName: "Last Name",
          columnType: "text"
        },
        {
          field: "type",
          headerName: "Type",
          cellClass: "cell--renders-html",
          cellRenderer: { data: "ContactTypeCell" },
          cellEditor: "ContactTypeEditor",
          columnType: "singleSelect",
          getHttpValue: (value: Model.ContactType | null): number | null => (!isNil(value) ? value.id : null),
          // Required to allow the dropdown to be selectable on Enter key.
          suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
            if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
              return true;
            }
            return false;
          },
          processCellForClipboard: (row: R) => {
            const contactType = util.getKeyValue<R, keyof R>("type")(row);
            if (isNil(contactType)) {
              return "";
            }
            return contactType.name;
          },
          processCellFromClipboard: (name: string) => {
            if (name.trim() === "") {
              return null;
            }
            const contactType = model.util.findChoiceForName<Model.ContactType>(model.models.ContactTypes, name);
            if (!isNil(contactType)) {
              return contactType;
            }
            return null;
          }
        },
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
