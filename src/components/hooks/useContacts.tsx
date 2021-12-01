import { useMemo, useState } from "react";
import { isNil } from "lodash";

import { CreateContactModal, EditContactModal } from "components/modals";

interface UseContactsProps {
  readonly onAttachmentRemoved?: (id: number, attachmentId: number) => void;
  readonly onAttachmentAdded?: (id: number, m: Model.Attachment) => void;
  readonly onCreated: (m: Model.Contact) => void;
  readonly onUpdated: (m: Model.Contact) => void;
  readonly initialCreateValues?: Partial<Http.ContactPayload>;
}

type UseContactsReturnType = [JSX.Element, JSX.Element, (id: number) => void, () => void];

const useContacts = (props: UseContactsProps): UseContactsReturnType => {
  const [contactToEdit, setContactToEdit] = useState<number | undefined>(undefined);
  const [newContactModalOpen, setNewContactModalOpen] = useState(false);

  const createModal = useMemo(
    () => (
      <CreateContactModal
        open={newContactModalOpen}
        initialValues={props.initialCreateValues}
        onCancel={() => setNewContactModalOpen(false)}
        onSuccess={(m: Model.Contact) => props.onCreated(m)}
      />
    ),
    [props.initialCreateValues, newContactModalOpen, props.onCreated]
  );

  const editModal = useMemo(() => {
    if (!isNil(contactToEdit)) {
      return (
        <EditContactModal
          id={contactToEdit}
          onCancel={() => setContactToEdit(undefined)}
          onAttachmentRemoved={(id: number) => props.onAttachmentRemoved?.(contactToEdit, id)}
          onAttachmentAdded={(m: Model.Attachment) => props.onAttachmentAdded?.(contactToEdit, m)}
          onSuccess={(m: Model.Contact) => {
            setContactToEdit(undefined);
            props.onUpdated(m);
          }}
          open={true}
        />
      );
    }
    return <></>;
  }, [contactToEdit, props.onAttachmentRemoved, props.onAttachmentAdded, props.onUpdated]);

  return [createModal, editModal, setContactToEdit, () => setNewContactModalOpen(true)];
};

export default useContacts;
