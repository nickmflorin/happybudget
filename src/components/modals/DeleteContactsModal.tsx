import { useState, useEffect } from "react";
import { isNil, find, map, includes } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard } from "@fortawesome/free-solid-svg-icons";

import { removeFromArray } from "lib/util";

import DeleteModelsModal from "./DeleteModelsModal";

interface DeleteContactsModalProps {
  onOk: (contacts: IContact[]) => void;
  onCancel: () => void;
  visible: boolean;
  contacts: IContact[];
}

const DeleteContactsModal = ({ visible, contacts, onOk, onCancel }: DeleteContactsModalProps): JSX.Element => {
  const [contactsToDelete, setContactsToDelete] = useState<IContact[]>([]);

  useEffect(() => {
    setContactsToDelete(contacts);
  }, [contacts]);

  return (
    <DeleteModelsModal<IContact>
      title={"Delete Selected Contacts"}
      visible={visible}
      onCancel={() => onCancel()}
      onOk={() => onOk(contactsToDelete)}
      okText={"Delete"}
      cancelText={"Cancel"}
      confirm={"Please confirm the contacts to delete."}
      dataSource={contacts}
      itemProps={(contact: IContact) => ({
        text: contact.full_name,
        icon: <FontAwesomeIcon icon={faIdCard} />,
        checked: includes(
          map(contactsToDelete, (c: IContact) => c.id),
          contact.id
        ),
        onToggle: () => {
          const existing = find(contactsToDelete, { id: contact.id });
          if (!isNil(existing)) {
            setContactsToDelete(removeFromArray(contactsToDelete, "id", contact.id));
          } else {
            setContactsToDelete([...contactsToDelete, contact]);
          }
        }
      })}
    />
  );
};

export default DeleteContactsModal;
