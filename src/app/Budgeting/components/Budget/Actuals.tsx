import React, { useState, useEffect, useMemo, useRef, ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil, map, filter, reduce, find } from "lodash";

import { faTrashAlt, faFileCsv, faLineColumns } from "@fortawesome/pro-solid-svg-icons";

import { SuppressKeyboardEventParams } from "@ag-grid-community/core";

import { EditContactModal, CreateContactModal } from "components/modals";

import * as models from "lib/model";
import { useDeepEqualMemo } from "lib/hooks";
import { getKeyValue } from "lib/util";
import { downloadAsCsvFile } from "lib/util/files";
import { findChoiceForName, inferModelFromName, parseFirstAndLastName } from "lib/model/util";
import { agCurrencyValueFormatter, agDateValueFormatter } from "lib/model/formatters";
import { floatValueSetter, dateTimeValueSetter } from "lib/model/valueSetters";

import { WrapInApplicationSpinner } from "components";
import { FieldsDropdown } from "components/dropdowns";
import { Portal, BreadCrumbs } from "components/layout";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import * as actions from "../../store/actions/budget/actuals";
import { selectBudgetDetail } from "../../store/selectors";
import BudgetTableComponent from "../BudgetTable";

const selectActuals = simpleDeepEqualSelector((state: Modules.ApplicationStore) => state.budget.budget.actuals.data);
const selectContacts = simpleDeepEqualSelector((state: Modules.ApplicationStore) => state.user.contacts.data);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.actuals.search
);
const selectActualsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.actuals.loading
);

const Actuals = (): JSX.Element => {
  const [contactToEdit, setContactToEdit] = useState<number | null>(null);
  const [createContactModalVisible, setCreateContactModalVisible] = useState(false);

  const dispatch = useDispatch();
  const loading = useSelector(selectActualsLoading);
  const data = useSelector(selectActuals);
  const search = useSelector(selectTableSearch);
  const tableRef = useRef<BudgetTable.Ref<BudgetTable.ActualRow, Model.Actual>>(null);
  const budgetDetail = useSelector(selectBudgetDetail);
  const contacts = useSelector(selectContacts);

  useEffect(() => {
    dispatch(actions.requestActualsAction(null));
    dispatch(actions.requestSubAccountsTreeAction(null));
  }, []);

  // NOTE: Right now, the total actual value for a budget can differ from totaling the actual
  // rows of the actuals table.  This can occur if the actual is not yet assigned to a
  // subaccount.  For now, we will not worry about that.
  const actualsTableTotal = useMemo(() => {
    return reduce(data, (sum: number, s: Model.Actual) => sum + (s.value || 0), 0);
  }, [useDeepEqualMemo(data)]);

  const editingContact = useMemo(() => {
    if (!isNil(contactToEdit)) {
      const contact: Model.Contact | undefined = find(contacts, { id: contactToEdit } as any);
      if (!isNil(contact)) {
        return contact;
      } else {
        /* eslint-disable no-console */
        console.error(`Could not find contact with ID ${contactToEdit} in state.`);
        return null;
      }
    }
    return null;
  }, [contactToEdit]);

  return (
    <React.Fragment>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          items={[
            {
              id: "actuals",
              primary: true,
              text: "Actuals Log",
              tooltip: { title: "Actuals Log", placement: "bottom" }
            }
          ]}
        />
      </Portal>
      <WrapInApplicationSpinner loading={loading}>
        <BudgetTableComponent<BudgetTable.ActualRow, Model.Actual, Http.ActualPayload>
          // These two props aren't really applicable for the Actuals case, but until we separate out
          // the BudgetTable more, we have to add them.
          budgetType={"budget"}
          levelType={"budget"}
          data={data}
          tableRef={tableRef}
          indexColumn={{ width: 40, maxWidth: 50 }}
          search={search}
          onSearch={(value: string) => dispatch(actions.setActualsSearchAction(value))}
          onChangeEvent={(e: Table.ChangeEvent<BudgetTable.ActualRow, Model.Actual>) =>
            dispatch(actions.handleTableChangeEventAction(e))
          }
          actions={(params: BudgetTable.MenuActionParams<BudgetTable.ActualRow, Model.Actual>) => [
            {
              tooltip: "Delete",
              icon: faTrashAlt,
              onClick: () => {
                const rows: BudgetTable.ActualRow[] = params.apis.grid.getSelectedRows();
                dispatch(
                  actions.handleTableChangeEventAction({
                    type: "rowDelete",
                    payload: {
                      rows,
                      columns: params.columns
                    }
                  })
                );
              }
            },
            {
              text: "Columns",
              icon: faLineColumns,
              wrap: (children: ReactNode) => {
                return (
                  <FieldsDropdown
                    fields={map(params.columns, (col: Table.Column<BudgetTable.ActualRow, Model.Actual>) => ({
                      id: col.field as string,
                      label: col.headerName as string,
                      defaultChecked: true
                    }))}
                    onChange={(change: FieldCheck) => {
                      const tableRefObj = tableRef.current;
                      if (!isNil(tableRefObj)) {
                        tableRefObj.setColumnVisibility({ field: change.id, visible: change.checked });
                      }
                    }}
                  >
                    {children}
                  </FieldsDropdown>
                );
              }
            },
            {
              text: "Export CSV",
              icon: faFileCsv,
              wrap: (children: ReactNode) => {
                return (
                  <FieldsDropdown
                    fields={map(params.columns, (col: Table.Column<BudgetTable.ActualRow, Model.Actual>) => ({
                      id: col.field as string,
                      label: col.headerName as string,
                      defaultChecked: true
                    }))}
                    buttons={[
                      {
                        onClick: (checks: FieldCheck[]) => {
                          const tableRefObj = tableRef.current;
                          const fields = map(
                            filter(checks, (field: FieldCheck) => field.checked === true),
                            (field: FieldCheck) => field.id
                          );
                          if (fields.length !== 0 && !isNil(tableRefObj)) {
                            const csvData = tableRefObj.getCSVData(fields);
                            downloadAsCsvFile(
                              !isNil(budgetDetail) ? `${budgetDetail.name}_actuals` : "actuals",
                              csvData
                            );
                          }
                        },
                        text: "Download",
                        className: "btn--primary"
                      }
                    ]}
                  >
                    {children}
                  </FieldsDropdown>
                );
              }
            }
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
              processCellForClipboard: (row: BudgetTable.ActualRow) => {
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
                  map(data, (actual: Model.Actual) => actual.subaccount),
                  (sub: Model.SimpleSubAccount | null) => sub !== null && sub.identifier !== null
                ) as Model.SimpleSubAccount[];
                // NOTE: If there are multiple sub accounts with the same identifier, this will
                // return the first and issue a warning.
                const subaccount = inferModelFromName<Model.SimpleSubAccount>(availableSubAccounts, name, {
                  nameField: "identifier"
                });
                return subaccount;
              },
              cellRenderer: "BudgetItemCell",
              cellEditor: "SubAccountsTreeEditor",
              cellEditorParams: {
                setSearch: (value: string) => dispatch(actions.setSubAccountsTreeSearchAction(value))
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
            {
              field: "contact",
              headerName: "Contact",
              cellClass: "cell--centered",
              cellRenderer: "ContactCell",
              width: 120,
              cellEditor: "ContactCellEditor",
              columnType: "contact",
              cellRendererParams: {
                onEditContact: (id: number) => setContactToEdit(id)
              },
              cellEditorParams: {
                onNewContact: () => setCreateContactModalVisible(true)
              },
              // Required to allow the dropdown to be selectable on Enter key.
              suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
                if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
                  return true;
                }
                return false;
              },
              processCellForClipboard: (row: BudgetTable.ActualRow) => {
                const id = getKeyValue<BudgetTable.ActualRow, keyof BudgetTable.ActualRow>("contact")(row);
                if (isNil(id)) {
                  return "";
                }
                const contact: Model.Contact | undefined = find(contacts, { id } as any);
                return !isNil(contact) ? contact.full_name : "";
              },
              processCellFromClipboard: (name: string): Model.Contact | null => {
                if (name.trim() === "") {
                  return null;
                } else {
                  const names = parseFirstAndLastName(name);
                  const contact: Model.Contact | undefined = find(contacts, {
                    first_name: names[0],
                    last_name: names[1]
                  });
                  return contact || null;
                }
              }
            },
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
              valueFormatter: agDateValueFormatter,
              valueSetter: dateTimeValueSetter<BudgetTable.ActualRow>("date"),
              columnType: "date"
            },
            {
              field: "payment_method",
              headerName: "Pay Method",
              cellClass: "cell--centered",
              cellRenderer: "PaymentMethodCell",
              flex: 1,
              cellEditor: "PaymentMethodCellEditor",
              columnType: "singleSelect",
              getHttpValue: (value: Model.PaymentMethod | null): number | null => (!isNil(value) ? value.id : null),
              // Required to allow the dropdown to be selectable on Enter key.
              suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
                if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
                  return true;
                }
                return false;
              },
              processCellForClipboard: (row: BudgetTable.ActualRow) => {
                const payment_method = getKeyValue<BudgetTable.ActualRow, keyof BudgetTable.ActualRow>(
                  "payment_method"
                )(row);
                if (isNil(payment_method)) {
                  return "";
                }
                return payment_method.name;
              },
              processCellFromClipboard: (name: string) => {
                if (name.trim() === "") {
                  return null;
                }
                const payment_method = findChoiceForName<Model.PaymentMethod>(models.PaymentMethods, name);
                if (!isNil(payment_method)) {
                  return payment_method;
                }
                return null;
              }
            },
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
              valueFormatter: agCurrencyValueFormatter,
              valueSetter: floatValueSetter<BudgetTable.ActualRow>("value"),
              cellRenderer: "BodyCell",
              columnType: "currency",
              footer: { value: actualsTableTotal }
            }
          ]}
        />
      </WrapInApplicationSpinner>
      {!isNil(editingContact) && (
        <EditContactModal
          visible={true}
          contact={editingContact}
          onSuccess={() => setContactToEdit(null)}
          onCancel={() => setContactToEdit(null)}
        />
      )}
      <CreateContactModal
        visible={createContactModalVisible}
        onSuccess={() => setCreateContactModalVisible(false)}
        onCancel={() => setCreateContactModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default Actuals;
