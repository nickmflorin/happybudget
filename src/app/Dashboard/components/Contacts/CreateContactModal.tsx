import { useState } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobeAmericas, faPhone, faUserTag } from "@fortawesome/free-solid-svg-icons";

import { Form, Input, Select } from "antd";
import { MailOutlined, UserOutlined } from "@ant-design/icons";

import { ClientError, NetworkError, renderFieldErrorsInForm } from "api";
import { DisplayAlert } from "components/display";
import { Modal } from "components/modals";
import { ContactRoleModelsList } from "model";
import { createContact } from "services";
import { validateEmail } from "util/validate";

import { addContactToStateAction } from "../../actions";

interface CreateContactModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

// TODO: Create front end validators for phone number, city, and country.
const CreateContactModal = ({ open, onCancel, onSuccess }: CreateContactModalProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
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
          .then(values => {
            setLoading(true);
            createContact(values)
              .then((contact: IContact) => {
                setGlobalError(undefined);
                form.resetFields();
                dispatch(addContactToStateAction(contact));
                onSuccess();
              })
              .catch((e: Error) => {
                if (e instanceof ClientError) {
                  if (!isNil(e.errors.__all__)) {
                    /* eslint-disable no-console */
                    console.error(e.errors.__all__);
                    setGlobalError("There was a problem creating the contact.");
                  } else {
                    // Render the errors for each field next to the form field.
                    renderFieldErrorsInForm(form, e);
                  }
                } else if (e instanceof NetworkError) {
                  setGlobalError("There was a problem communicating with the server.");
                } else {
                  throw e;
                }
              })
              .finally(() => {
                setLoading(false);
              });
          })
          .catch(info => {
            return;
          });
      }}
    >
      <Form form={form} layout={"vertical"} name={"form_in_modal"} initialValues={{}}>
        <Form.Item
          name={"first_name"}
          label={"First Name"}
          rules={[{ required: true, message: "Please enter a valid first name." }]}
        >
          <Input prefix={<UserOutlined />} placeholder={"John"} />
        </Form.Item>
        <Form.Item
          name={"last_name"}
          label={"Last Name"}
          rules={[{ required: true, message: "Please enter a valid last name." }]}
        >
          <Input prefix={<UserOutlined />} placeholder={"Smith"} />
        </Form.Item>
        <Form.Item
          name={"email"}
          label={"Email"}
          rules={[
            { required: true, message: "Please enter a valid email." },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (value !== "" && !validateEmail(value)) {
                  return Promise.reject("Please enter a valid email.");
                }
                return Promise.resolve();
              }
            })
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder={"jsmith@gmail.com"} />
        </Form.Item>
        <Form.Item name={"city"} label={"City"} rules={[{ required: true, message: "Please enter a valid city." }]}>
          <Input prefix={<FontAwesomeIcon icon={faGlobeAmericas} />} placeholder={"Los Angeles"} />
        </Form.Item>
        <Form.Item
          name={"country"}
          label={"Country"}
          rules={[{ required: true, message: "Please enter a valid country." }]}
        >
          <Input prefix={<FontAwesomeIcon icon={faGlobeAmericas} />} placeholder={"United States"} />
        </Form.Item>
        <Form.Item
          name={"phone_number"}
          label={"Phone Number"}
          rules={[{ required: true, message: "Please enter a valid phone number." }]}
        >
          <Input prefix={<FontAwesomeIcon icon={faPhone} />} placeholder={"+15551234567"} />
        </Form.Item>
        <Form.Item name={"role"} label={"Role"} rules={[{ required: true }]}>
          <Select suffixIcon={<FontAwesomeIcon icon={faUserTag} />} placeholder={"Producer"}>
            {ContactRoleModelsList.map((model: ContactRoleModel, index: number) => (
              <Select.Option key={index} value={model.id}>
                {model.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <DisplayAlert>{globalError}</DisplayAlert>
      </Form>
    </Modal>
  );
};

export default CreateContactModal;
