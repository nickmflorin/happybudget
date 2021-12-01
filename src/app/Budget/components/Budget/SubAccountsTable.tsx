import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { isNil, filter } from "lodash";

import { model, tabling } from "lib";

import { actions, selectors } from "store";
import { useContacts } from "components/hooks";
import { SubAccountsTable as GenericSubAccountsTable } from "components/tabling";
import { selectFringes, selectSubAccountUnits } from "../../store/selectors";
import FringesModal from "./FringesModal";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

type OmitTableProps =
  | "contacts"
  | "onEditContact"
  | "onNewContact"
  | "menuPortalId"
  | "columns"
  | "fringes"
  | "subAccountUnits"
  | "onEditFringes"
  | "onAddFringes"
  | "onExportPdf"
  | "onSearchContact";

export interface BudgetSubAccountsTableProps
  extends Omit<GenericSubAccountsTable.AuthenticatedBudgetProps, OmitTableProps> {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const SubAccountsTable = ({
  budget,
  budgetId,
  setPreviewModalVisible,
  ...props
}: BudgetSubAccountsTableProps): JSX.Element => {
  const [preContactEdit, setPreContactEdit] = useState<Table.EditableRowId | null>(null);
  const [preContactCreate, setPreContactCreate] = useState<{ name?: string; id: Table.EditableRowId } | null>(null);
  const [initialContactFormValues, setInitialContactFormValues] = useState<any>(null);
  const [fringesModalVisible, setFringesModalVisible] = useState(false);

  const dispatch = useDispatch();
  const contacts = useSelector(selectors.selectContacts);
  const table = tabling.hooks.useTableIfNotDefined<R, M>(props.table);
  const fringes = useSelector(selectFringes);
  const subaccountUnits = useSelector(selectSubAccountUnits);

  const onContactCreated = useMemo(
    () => (m: Model.Contact) => {
      dispatch(actions.authenticated.addContactToStateAction(m));
      setPreContactCreate(null);
      setInitialContactFormValues(null);
      // If we have enough information from before the contact was created in the specific
      // cell, combine that information with the new value to perform a table update, showing
      // the created contact in the new cell.
      if (!isNil(preContactCreate)) {
        const row: Table.BodyRow<R> | null = table.current.getRow(preContactCreate.id);
        if (!isNil(row) && tabling.typeguards.isModelRow(row)) {
          let rowChange: Table.RowChange<R> = {
            id: row.id,
            data: { contact: { oldValue: row.data.contact || null, newValue: m.id } }
          };
          // If the Row does not already specify a rate and the Contact does specify a rate,
          // use the rate that is specified for the Contact.
          if (m.rate !== null && row.data.rate === null) {
            rowChange = {
              ...rowChange,
              data: { ...rowChange.data, rate: { oldValue: row.data.rate, newValue: m.rate } }
            };
          }
          table.current.applyTableChange({
            type: "dataChange",
            payload: rowChange
          });
        }
      }
    },
    [preContactCreate, table.current]
  );

  const onContactUpdated = useMemo(
    () => (m: Model.Contact) => {
      dispatch(actions.authenticated.updateContactInStateAction({ id: m.id, data: m }));
      setPreContactEdit(null);
      if (!isNil(preContactEdit)) {
        const row: Table.BodyRow<R> | null = table.current.getRow(preContactEdit);
        if (!isNil(row) && tabling.typeguards.isModelRow(row) && row.data.rate === null && m.rate !== null) {
          table.current.applyTableChange({
            type: "dataChange",
            payload: {
              id: row.id,
              data: { rate: { oldValue: row.data.rate, newValue: m.rate } }
            }
          });
        }
      }
    },
    [preContactEdit, table.current]
  );

  const [createContactModal, editContactModal, editContact, createContact] = useContacts({
    initialCreateValues: initialContactFormValues,
    onCreated: onContactCreated,
    onUpdated: onContactUpdated
  });

  return (
    <React.Fragment>
      <GenericSubAccountsTable.AuthenticatedBudget
        {...props}
        table={table}
        contacts={contacts}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        onEditContact={(params: { contact: number; id: Table.EditableRowId }) => {
          setPreContactEdit(params.id);
          editContact(params.contact);
        }}
        onExportPdf={() => setPreviewModalVisible(true)}
        subAccountUnits={subaccountUnits}
        onAddFringes={() => setFringesModalVisible(true)}
        onEditFringes={() => setFringesModalVisible(true)}
        fringes={
          filter(fringes, (f: Table.BodyRow<Tables.FringeRowData>) =>
            tabling.typeguards.isModelRow(f)
          ) as Tables.FringeRow[]
        }
        onSearchContact={(v: string) => dispatch(actions.authenticated.setContactsSearchAction(v))}
        onNewContact={(params: { name?: string; id: Table.EditableRowId }) => {
          setPreContactCreate(params);
          setInitialContactFormValues(null);
          if (!isNil(params.name)) {
            const [firstName, lastName] = model.util.parseFirstAndLastName(params.name);
            setInitialContactFormValues({
              first_name: firstName,
              last_name: lastName
            });
          }
          createContact();
        }}
      />
      {createContactModal}
      {editContactModal}
      <FringesModal budget={budget} open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default SubAccountsTable;
