import { useState, useEffect } from "react";
import { isNil, find, map, includes } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard } from "@fortawesome/free-solid-svg-icons";

import { util } from "lib";

import DeleteModelsModal from "./DeleteModelsModal";

interface DeleteContactsModalProps {
  onOk: (contacts: Model.Contact[]) => void;
  onCancel: () => void;
  visible: boolean;
  contacts: Model.Contact[];
}

const DeleteContactsModal = ({ visible, contacts, onOk, onCancel }: DeleteContactsModalProps): JSX.Element => {
  const [contactsToDelete, setContactsToDelete] = useState<Model.Contact[]>([]);

  useEffect(() => {
    setContactsToDelete(contacts);
  }, [contacts]);

  return (
    <DeleteModelsModal<Model.Contact>
      title={"Delete Selected Contacts"}
      visible={visible}
      onCancel={() => onCancel()}
      onOk={() => onOk(contactsToDelete)}
      okText={"Delete"}
      cancelText={"Cancel"}
      confirm={"Please confirm the contacts to delete."}
      dataSource={contacts}
      itemProps={(contact: Model.Contact) => ({
        text: contact.full_name,
        icon: <FontAwesomeIcon icon={faIdCard} />,
        checked: includes(
          map(contactsToDelete, (c: Model.Contact) => c.id),
          contact.id
        ),
        onToggle: () => {
          const existing = find(contactsToDelete, { id: contact.id });
          if (!isNil(existing)) {
            setContactsToDelete(util.removeFromArray(contactsToDelete, "id", contact.id));
          } else {
            setContactsToDelete([...contactsToDelete, contact]);
          }
        }
      })}
    />
  );
};

export default DeleteContactsModal;
