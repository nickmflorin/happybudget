import { isNil, map, filter, find } from "lodash";

import { model, tabling } from "lib";

import { framework } from "components/tabling/generic";
import { ReadWriteModelTable, ReadWriteModelTableProps } from "../ModelTable";
import Framework from "./framework";

type R = Tables.ActualRow;
type M = Model.Actual;

type PreContactCreate = Omit<Table.CellChange<Tables.SubAccountRow, Model.SubAccount>, "newValue">;

type OmitTableProps = "columns" | "getRowLabel" | "actions" | "showPageFooter";

export interface ActualsTableProps extends Omit<ReadWriteModelTableProps<R, M>, OmitTableProps> {
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
  const tableRef = tabling.hooks.useReadWriteTableIfNotDefined<R, M>(props.tableRef);
  return (
    <ReadWriteModelTable<R, M>
      {...props}
      defaultRowLabel={"Actual"}
      showPageFooter={false}
      tableRef={tableRef}
      getRowLabel={(m: M) => m.description}
      framework={tabling.util.combineFrameworks(Framework, props.framework)}
      actions={(params: Table.ReadWriteMenuActionParams<R, M>) => [
        framework.actions.ToggleColumnAction(tableRef.current, params),
        framework.actions.ExportCSVAction(tableRef.current, params, exportFileName)
      ]}
      columns={[
        framework.columnObjs.SelectColumn({
          field: "subaccount",
          headerName: "Sub-Account",
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
              map(props.models, (actual: M) => actual.subaccount),
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
          footer: {
            value: "Actuals Total"
          }
        }),
        framework.columnObjs.BodyColumn({
          field: "description",
          headerName: "Description",
          flex: 3,
          columnType: "longText"
        }),
        framework.columnObjs.ModelSelectColumn<R, M, Model.Contact>({
          field: "contact",
          headerName: "Contact",
          cellRenderer: { data: "ContactCell" },
          cellEditor: "ContactEditor",
          columnType: "contact",
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
        framework.columnObjs.BodyColumn({
          field: "purchase_order",
          headerName: "Purchase Order",
          flex: 1,
          columnType: "number",
          tableColumnType: "body"
        }),
        framework.columnObjs.BodyColumn({
          field: "date",
          headerName: "Date",
          flex: 1,
          valueFormatter: tabling.formatters.agDateValueFormatter,
          valueSetter: tabling.valueSetters.dateTimeValueSetter<R>("date"),
          columnType: "date"
        }),
        framework.columnObjs.ChoiceSelectColumn<R, M, Model.PaymentMethod>({
          field: "payment_method",
          headerName: "Pay Method",
          cellRenderer: { data: "PaymentMethodCell" },
          cellEditor: "PaymentMethodEditor",
          models: model.models.PaymentMethods
        }),
        framework.columnObjs.BodyColumn({
          field: "payment_id",
          headerName: "Pay ID",
          flex: 1,
          columnType: "number"
        }),
        framework.columnObjs.BodyColumn({
          field: "value",
          headerName: "Amount",
          flex: 1,
          valueFormatter: tabling.formatters.agCurrencyValueFormatter,
          valueSetter: tabling.valueSetters.floatValueSetter<R>("value"),
          cellRenderer: "BodyCell",
          columnType: "currency",
          footer: { value: actualsTableTotal }
        })
      ]}
    />
  );
};

export default ActualsTable;
