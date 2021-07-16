import { useState } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";

import * as api from "api";

import { Form } from "components";
import { ContactForm } from "components/forms";
import { Modal } from "components/modals";

import { addContactToStateAction } from "store/actions";

import "./ContactModal.scss";

interface CreateContactModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateContactModal = ({ open, onCancel, onSuccess }: CreateContactModalProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const dispatch: Dispatch = useDispatch();

  return (
    <Modal
      className={"contact-modal"}
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
            api
              .createContact(values)
              .then((contact: Model.Contact) => {
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