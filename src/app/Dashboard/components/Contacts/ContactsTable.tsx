import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";
import { forEach, isNil, map } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import { Table, ActionsTableCell, ModelSelectController } from "components/tables";

import {
  requestContactsAction,
  setContactsPageAction,
  setContactsPageSizeAction,
  setContactsPageAndSizeAction,
  selectContactsAction
} from "../../actions";

interface IRow {
  key: number;
  name: string;
  role: ContactRoleName;
  phone_number: string;
  email: string;
  contact: IContact;
}

const ContactsTable = (): JSX.Element => {
  const [contactToEdit, setContactToEdit] = useState<IContact | undefined>(undefined);
  const [contactsToDelete, setContactsToDelete] = useState<IContact[] | undefined>(undefined);
  const [data, setData] = useState<any[]>([]);
  const contacts = useSelector((state: Redux.IApplicationStore) => state.dashboard.contacts);
  const dispatch: Dispatch = useDispatch();

  useEffect(() => {
    dispatch(requestContactsAction());
  }, []);

  useEffect(() => {
    const tableData: IRow[] = [];
    forEach(contacts.data, (contact: IContact) => {
      tableData.push({
        key: contact.id,
        name: contact.full_name,
        role: contact.role_name,
        email: contact.email,
        phone_number: contact.phone_number,
        contact
      });
    });
    setData(tableData);
  }, [contacts.data]);

  return (
    <React.Fragment>
      <ModelSelectController<IContact>
        selected={contacts.selected}
        data={contacts.data}
        entityName={"contact"}
        items={[
          {
            actionName: "Delete",
            icon: <FontAwesomeIcon icon={faTrashAlt} />,
            onClick: (ctcts: IContact[]) => setContactsToDelete(ctcts)
          }
        ]}
      />
      <Table
        className={"admin-table"}
        tableLayout={"fixed"}
        dataSource={data}
        loading={contacts.loading}
        rowSelection={{
          selectedRowKeys: contacts.selected,
          onChange: (selectedKeys: React.ReactText[]) => {
            const selectedCs = map(selectedKeys, (key: React.ReactText) => String(key));
            if (selectedCs.length === contacts.selected.length) {
              dispatch(selectContactsAction([]));
            } else {
              const selectedContactIds = map(selectedCs, (c: string) => parseInt(c));
              dispatch(selectContactsAction(selectedContactIds));
            }
          }
        }}
        pagination={{
          hideOnSinglePage: true,
          defaultPageSize: 10,
          pageSize: contacts.pageSize,
          current: contacts.page,
          showSizeChanger: true,
          total: contacts.count,
          onChange: (pg: number, size: number | undefined) => {
            dispatch(setContactsPageAction(pg));
            if (!isNil(size)) {
              dispatch(setContactsPageSizeAction(size));
            }
          },
          onShowSizeChange: (pg: number, size: number) => {
            dispatch(setContactsPageAndSizeAction({ page: pg, pageSize: size }));
          }
        }}
        columns={[
          {
            title: "Name",
            key: "name",
            dataIndex: "name"
          },
          {
            title: "Role",
            key: "role",
            dataIndex: "role"
          },
          {
            title: "Type",
            key: "type",
            dataIndex: "type"
          },
          {
            title: "Location",
            key: "location",
            dataIndex: "contact",
            render: (contact: IContact) => {
              return (
                <div>
                  <span>{contact.city}</span>
                  <span>{","}</span>
                  <span>{contact.country}</span>
                </div>
              );
            }
          },
          {
            title: "Phone",
            key: "phone_number",
            dataIndex: "phone_number"
          },
          {
            title: "Email",
            key: "email",
            dataIndex: "email"
          },
          {
            key: "action",
            dataIndex: "contact",
            render: (contact: IContact) => (
              <ActionsTableCell
                actions={[
                  {
                    tooltip: `Edit ${contact.full_name}`,
                    onClick: () => setContactToEdit(contact),
                    icon: <FontAwesomeIcon icon={faEdit} />
                  },
                  {
                    tooltip: `Delete ${contact.full_name}`,
                    onClick: () => setContactsToDelete([contact]),
                    icon: <FontAwesomeIcon icon={faTrashAlt} />
                  }
                ]}
              />
            )
          }
        ]}
      />
    </React.Fragment>
  );
};

export default ContactsTable;
