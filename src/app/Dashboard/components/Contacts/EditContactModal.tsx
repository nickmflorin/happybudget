import { useState } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { isNil } from "lodash";

import * as api from "api";

import { Form } from "components";
import { ContactForm } from "components/forms";
import { Modal } from "components/modals";

import { updateContactInStateAction } from "store/actions";

import "./ContactForm.scss";

import "./ContactModal.scss";

interface EditContactModalProps {
  contact: Model.Contact;
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditContactModal = ({ contact, visible, onCancel, onSuccess }: EditContactModalProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();
  const dispatch: Dispatch = useDispatch();

  return (
    <Modal
      className={"contact-modal"}
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
            api
              .updateContact(contact.id, values)
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
          type: !isNil(contact.type) ? contact.type : null,
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
    </Modal>
  );
};

export default EditContactModal;
