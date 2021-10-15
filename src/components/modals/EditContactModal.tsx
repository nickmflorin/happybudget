import React, { useState, useRef, useMemo } from "react";
import { isNil } from "lodash";

import * as api from "api";

import { ContactForm } from "components/forms";

import { EditModelModal, EditModelModalProps } from "./generic";
import ContactModalHeader, { IContactModalHeaderRef } from "./ContactModalHeader";
import "./ContactModal.scss";

interface EditContactModalProps extends EditModelModalProps<Model.Contact> {}

const MemoizedContactForm = React.memo(ContactForm);

const EditContactModal = (props: EditContactModalProps): JSX.Element => {
  const [image, setImage] = useState<UploadedImage | null | undefined>(undefined);
  /*
  Note: We have to use a ref here, instead of storing firstName and lastName in the state
  of this component, because if we were storing it in this component, when the firstName and
  lastName change it causes the entire component to rerender, and AntD rerenders all form fields
  when the form rerenders, which causes the auto focus to be lost on the first and last name fields.
  */
  const headerRef = useRef<IContactModalHeaderRef | null>(null);

  const onValuesChange = useMemo(
    () => (changedValues: Partial<Http.ContactPayload>, values: Http.ContactPayload) => {
      if (!isNil(changedValues.first_name)) {
        headerRef.current?.setFirstName(changedValues.first_name);
      }
      if (!isNil(changedValues.last_name)) {
        headerRef.current?.setLastName(changedValues.last_name);
      }
    },
    []
  );

  return (
    <EditModelModal
      {...props}
      className={"contact-modal"}
      update={api.updateContact}
      request={api.getContact}
      autoFocusField={1}
      title={(contact: Model.Contact, form: FormInstance<Http.ContactPayload>) => (
        <ContactModalHeader
          value={contact.image}
          onChange={(f: UploadedImage | null) => setImage(f)}
          onError={(error: Error | string) => form.notify(typeof error === "string" ? error : error.message)}
          ref={headerRef}
          initialValues={{ first_name: contact.first_name, last_name: contact.last_name }}
        />
      )}
      interceptPayload={(p: Http.ContactPayload) => {
        // We have to account for allowing the image to be null, which is the case
        // when we are deleting the image for the contact.
        if (image !== undefined) {
          return { ...p, image: !isNil(image) ? image.data : null };
        }
        return p;
      }}
      setFormData={(contact: Model.Contact, form: FormInstance<Http.ContactPayload>) =>
        form.setFields([
          { name: "type", value: contact.type },
          { name: "first_name", value: contact.first_name },
          { name: "last_name", value: contact.last_name },
          { name: "company", value: contact.company },
          { name: "email", value: contact.email },
          { name: "position", value: contact.position },
          { name: "rate", value: contact.rate },
          { name: "city", value: contact.city },
          { name: "phone_number", value: contact.phone_number }
        ])
      }
    >
      {(m: Model.Contact | null, form: FormInstance<Http.ContactPayload>) => (
        <MemoizedContactForm form={form} onValuesChange={onValuesChange} />
      )}
    </EditModelModal>
  );
};

export default EditContactModal;
