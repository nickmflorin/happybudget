import { useState } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";

import { Form } from "components";
import { ContactForm } from "components/forms";
import { Modal } from "components/modals";
import { createContact } from "api/services";

import { addContactToStateAction } from "../actions";

interface CreateContactModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

// TODO: Create front end validators for phone number, city, and country.
const CreateContactModal = ({ open, onCancel, onSuccess }: CreateContactModalProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const dispatch: Dispatch = useDispatch();

  return (
    <Modal
      title={"Create a New Contact"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      cancelText={"Cancel"}
      loading={loading}
      onOk={() => {
        form
          .validateFields()
          .then((values: any) => {
            setLoading(true);
            createContact(values)
              .then((contact: IContact) => {
                form.resetFields();
                dispatch(addContactToStateAction(contact));
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
      <ContactForm form={form} />
    </Modal>
  );
};

export default CreateContactModal;
