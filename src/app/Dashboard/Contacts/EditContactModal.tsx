import { useState } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";

import { Form } from "components";
import { ContactForm } from "components/forms";
import { Modal } from "components/modals";
import { updateContact } from "api/services";

import { updateContactInStateAction } from "../actions";

interface EditContactModalProps {
  contact: Model.Contact;
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

// TODO: Create front end validators for phone number, city, and country.
const EditContactModal = ({ contact, visible, onCancel, onSuccess }: EditContactModalProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();
  const dispatch: Dispatch = useDispatch();

  return (
    <Modal
      title={`Edit Contact: ${contact.full_name}`}
      visible={visible}
      onCancel={() => onCancel()}
      okText={"Save"}
      cancelText={"Cancel"}
      loading={loading}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.ContactPayload) => {
            setLoading(true);
            updateContact(contact.id, values)
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
        initialValues={{
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          role: contact.role.id,
          country: contact.country,
          city: contact.city,
          phone_number: contact.phone_number
        }}
      />
    </Modal>
  );
};

export default EditContactModal;
