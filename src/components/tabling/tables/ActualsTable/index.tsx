import { isNil, map, filter, find } from "lodash";

import { faTrashAlt } from "@fortawesome/pro-regular-svg-icons";

import { SuppressKeyboardEventParams } from "@ag-grid-community/core";

import { model, tabling } from "lib";

import { ModelTable, ModelTableProps } from "components/tabling";
import { framework } from "components/tabling/generic";

import Framework from "./framework";

type R = Tables.ActualRow;
type M = Model.Actual;

type PreContactCreate = Omit<Table.CellChange<Tables.SubAccountRow, Model.SubAccount>, "newValue">;

type OmitTableProps = "columns" | "getRowLabel" | "actions" | "showPageFooter";

export interface ActualsTableProps extends Omit<ModelTableProps<R, M>, OmitTableProps> {
  readonly exportFileName: string;
  readonly contacts: Model.Contact[];
  readonly actualsTableTotal: number;
  readonly onSubAccountsTreeSearch: (value: string) => void;
  readonly onNewContact: (params: { name?: string; change: PreContactCreate }) => void;
  readonly onEditContact: (id: number) => void;
}

const ActualsTable = ({
  exportFileName,
  contacts,
  actualsTableTotal,
  onSubAccountsTreeSearch,
  onNewContact,
  onEditContact,
  ...props
}: ActualsTableProps): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined<R, M>(props.table);
  return (
    <ModelTable<R, M>
      {...props}
      defaultRowLabel={"Actual"}
      showPageFooter={false}
      table={table}
      getRowLabel={(m: M) => m.description}
      framework={tabling.util.combineFrameworks(Framework, props.framework)}
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
          field: "subaccount",
          headerName: "Sub-Account",
          columnType: "singleSelect",
          minWidth: 200,
          maxWidth: 200,
          width: 200,
          getHttpValue: (value: Model.SimpleSubAccount | null): number | null => {
            if (!isNil(value)) {
              return value.id;
            }
            return value;
          },
          processCellForClipboard: (row: R) => {
            if (!isNil(row.subaccount)) {
              return row.subaccount.identifier || "";
            }
            return "";
          },
          processCellFromClipboard: (name: string) => {
            if (name.trim() === "") {
              return null;
            }
            const availableSubAccounts: Model.SimpleSubAccount[] = filter(
              map(props.data, (actual: M) => actual.subaccount),
              (sub: Model.SimpleSubAccount | null) => sub !== null && sub.identifier !== null
            ) as Model.SimpleSubAccount[];
            // NOTE: If there are multiple sub accounts with the same identifier, this will
            // return the first and issue a warning.
            const subaccount = model.util.inferModelFromName<Model.SimpleSubAccount>(availableSubAccounts, name, {
              nameField: "identifier"
            });
            return subaccount;
          },
          cellRenderer: { data: "SubAccountCell" },
          cellEditor: "SubAccountsTreeEditor",
          cellEditorParams: {
            setSearch: (value: string) => onSubAccountsTreeSearch(value)
          },
          // Required to allow the dropdown to be selectable on Enter key.
          suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
            if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
              return true;
            }
            return false;
          },
          footer: {
            value: "Actuals Total"
          }
        },
        {
          field: "description",
          headerName: "Description",
          flex: 3,
          columnType: "longText"
        },
        framework.columnObjs.ModelSelectColumn<R, M, Model.Contact>({
          field: "contact",
          headerName: "Contact",
          cellRenderer: { data: "ContactCell" },
          cellEditor: "ContactEditor",
          columnType: "contact",
          index: 2,
          cellRendererParams: { onEditContact },
          cellEditorParams: { onNewContact },
          models: contacts,
          modelClipboardValue: (m: Model.Contact) => m.full_name,
          processCellFromClipboard: (name: string): Model.Contact | null => {
            if (name.trim() === "") {
              return null;
            } else {
              const names = model.util.parseFirstAndLastName(name);
              const contact: Model.Contact | undefined = find(contacts, {
                first_name: names[0],
                last_name: names[1]
              });
              return contact || null;
            }
          }
        }),
        {
          field: "purchase_order",
          headerName: "Purchase Order",
          flex: 1,
          columnType: "number"
        },
        {
          field: "date",
          headerName: "Date",
          flex: 1,
          valueFormatter: tabling.formatters.agDateValueFormatter,
          valueSetter: tabling.valueSetters.dateTimeValueSetter<R>("date"),
          columnType: "date"
        },
        framework.columnObjs.ChoiceSelectColumn<R, M, Model.PaymentMethod>({
          field: "payment_method",
          headerName: "Pay Method",
          cellRenderer: { data: "PaymentMethodCell" },
          cellEditor: "PaymentMethodEditor",
          models: model.models.PaymentMethods
        }),
        {
          field: "payment_id",
          headerName: "Pay ID",
          flex: 1,
          columnType: "number"
        },
        {
          field: "value",
          headerName: "Amount",
          flex: 1,
          valueFormatter: tabling.formatters.agCurrencyValueFormatter,
          valueSetter: tabling.valueSetters.floatValueSetter<R>("value"),
          cellRenderer: "BodyCell",
          columnType: "currency",
          footer: { value: actualsTableTotal }
        }
      ]}
    />
  );
};

export default ActualsTable;
