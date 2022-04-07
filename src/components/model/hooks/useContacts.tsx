import { useMemo, useState } from "react";
import { isNil } from "lodash";

import { model } from "lib";
import { CreateContactModal, EditContactModal } from "components/modals";

interface UseContactsProps {
  readonly onAttachmentRemoved?: (id: number, attachmentId: number) => void;
  readonly onAttachmentAdded?: (id: number, m: Model.Attachment) => void;
  readonly onCreated?: (m: Model.Contact, params?: CreateContactParams) => void;
  readonly onUpdated?: (m: Model.Contact, params: EditContactParams) => void;
}

type UseContactsReturnType = [
  JSX.Element | null,
  JSX.Element | null,
  (params: EditContactParams) => void,
  (params?: CreateContactParams) => void
];

export type CreateContactParams = {
  readonly name?: string;
  readonly rowId?: Table.ModelRowId;
};

export type EditContactParams = {
  readonly id: number;
  readonly rowId?: Table.ModelRowId;
};

const useContacts = (props: UseContactsProps): UseContactsReturnType => {
  const [newContactModal, setNewContactModal] = useState<JSX.Element | null>(null);
  const [editContactModal, setEditContactModal] = useState<JSX.Element | null>(null);

  const createContact = useMemo(
    () => (params?: CreateContactParams) => {
      let initialValues: Partial<Http.ContactPayload> = {};
      const name = params?.name;
      if (!isNil(name)) {
        const [firstName, lastName] = model.parseFirstAndLastName(name);
        initialValues = { first_name: firstName, last_name: lastName };
      }
      const modal = (
        <CreateContactModal
          open={true}
          initialValues={initialValues}
          onCancel={() => setNewContactModal(null)}
          onSuccess={(m: Model.Contact) => {
            setNewContactModal(null);
            props.onCreated?.(m, params);
          }}
        />
      );
      setNewContactModal(modal);
    },
    [props.onCreated]
  );

  const editContact = useMemo(
    () => (params: EditContactParams) => {
      const modal = (
        <EditContactModal
          modelId={params.id}
          onCancel={() => setEditContactModal(null)}
          onAttachmentRemoved={(id: number) => props.onAttachmentRemoved?.(params.id, id)}
          onAttachmentAdded={(m: Model.Attachment) => props.onAttachmentAdded?.(params.id, m)}
          onSuccess={(m: Model.Contact) => {
            setEditContactModal(null);
            props.onUpdated?.(m, params);
          }}
          open={true}
        />
      );
      setEditContactModal(modal);
    },
    [props.onUpdated, props.onAttachmentAdded, props.onAttachmentRemoved]
  );

  return [newContactModal, editContactModal, editContact, createContact];
};

export default useContacts;
