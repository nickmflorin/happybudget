import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import * as api from "api";
import { actions } from "store";

import { Form } from "components";
import { ContactForm } from "components/forms";
import { Modal } from "components";

import ContactModalHeader, { IContactModalHeaderRef } from "./ContactModalHeader";
import "./ContactModal.scss";

interface EditContactModalProps {
  contact: Model.Contact;
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const MemoizedContactForm = React.memo(ContactForm);

const EditContactModal = ({ contact, visible, onCancel, onSuccess }: EditContactModalProps): JSX.Element => {
  const [image, setImage] = useState<UploadedImage | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const [form] = Form.useForm<Http.ContactPayload>({ isInModal: true, autoFocusField: 1 });
  const dispatch: Redux.Dispatch = useDispatch();
  /*
  Note: We have to use a ref here, instead of storing firstName and lastName in the state
  of this component, because if we were storing it in this component, when the firstName and
  lastName change it causes the entire component to rerender, and AntD rerenders all form fields
  when the form rerenders, which causes the auto focus to be lost on the first and last name fields.
  */
  const headerRef = useRef<IContactModalHeaderRef | null>(null);

  useEffect(() => {
    return () => {
      headerRef.current?.setFirstName(null);
      headerRef.current?.setLastName(null);
      setImage(null);
      form.resetFields();
    };
  }, []);

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
    <Modal.Modal
      className={"contact-modal"}
      title={
        <ContactModalHeader
          value={contact.image}
          onChange={(f: UploadedImage | null) => setImage(f)}
          onError={(error: Error | string) => form.setGlobalError(error)}
          ref={headerRef}
          initialValues={{ first_name: contact.first_name, last_name: contact.last_name }}
        />
      }
      visible={visible}
      onCancel={() => onCancel()}
      okText={"Save"}
      cancelText={"Cancel"}
      loading={loading}
      getContainer={false}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.ContactPayload) => {
            setLoading(true);
            let payload = { ...values };
            // We have to account for allowing the image to be null, which is the case
            // when we are deleting the image for the contact.
            if (image !== undefined) {
              payload = { ...payload, image: !isNil(image) ? image.data : null };
            }
            api
              .updateContact(contact.id, payload)
              .then((newContact: Model.Contact) => {
                setGlobalError(undefined);
                form.resetFields();
                dispatch(actions.authenticated.updateContactInStateAction({ id: contact.id, data: newContact }));
                onSuccess();
              })
              .catch((e: Error) => {
                form.handleRequestError(e);
              })
              .finally(() => {
                setLoading(false);
              });
          })
          .catch(() => {
            return;
          });
      }}
    >
      <MemoizedContactForm
        form={form}
        globalError={globalError}
        onValuesChange={onValuesChange}
        initialValues={{
          type: !isNil(contact.type) ? contact.type.id : null,
          first_name: contact.first_name,
          last_name: contact.last_name,
          company: contact.company,
          email: contact.email,
          position: contact.position,
          rate: contact.rate,
          city: contact.city,
          phone_number: contact.phone_number
        }}
      />
    </Modal.Modal>
  );
};

export default EditContactModal;
