import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { isNil } from "lodash";

import * as api from "api";

import { Form } from "components";
import { ContactForm } from "components/forms";
import { Modal } from "components";

import { updateContactInStateAction } from "store/actions";

import ContactModalHeader from "./ContactModalHeader";
import "./ContactModal.scss";

interface EditContactModalProps {
  contact: Model.Contact;
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditContactModal = ({ contact, visible, onCancel, onSuccess }: EditContactModalProps): JSX.Element => {
  const [image, setImage] = useState<UploadedImage | null | undefined>(undefined);
  const [firstName, setFirstName] = useState<string | null>(contact.first_name);
  const [lastName, setLastName] = useState<string | null>(contact.last_name);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const [form] = Form.useForm<Http.ContactPayload>({ isInModal: true, autoFocusField: 1 });
  const dispatch: Dispatch = useDispatch();

  useEffect(() => {
    if (visible === true) {
      form.resetFields();
    }
  }, [visible]);

  return (
    <Modal.Modal
      className={"contact-modal"}
      title={
        <ContactModalHeader
          value={contact.image}
          onChange={(f: UploadedImage | null) => setImage(f)}
          onError={(error: Error | string) => form.setGlobalError(error)}
          firstName={firstName}
          lastName={lastName}
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
                dispatch(updateContactInStateAction({ id: contact.id, data: newContact }));
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
      <ContactForm
        form={form}
        globalError={globalError}
        onFirstNameChange={(value: string) => setFirstName(value)}
        onLastNameChange={(value: string) => setLastName(value)}
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
