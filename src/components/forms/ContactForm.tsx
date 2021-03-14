import { Input, Select } from "antd";
import { FormInstance } from "antd/lib/form";
import { MailOutlined, UserOutlined } from "@ant-design/icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobeAmericas, faPhone, faUserTag } from "@fortawesome/free-solid-svg-icons";

import { DisplayAlert } from "components/display";
import { ContactRoleModelsList } from "model";
import { validateEmail } from "util/validate";

import Form from "./Form";

interface ContactFormProps {
  form: FormInstance<Http.IContactPayload>;
  initialValues?: Http.IContactPayload;
  globalError?: string;
}

const ContactForm = ({ form, initialValues, globalError }: ContactFormProps): JSX.Element => {
  return (
    <Form
      form={form}
      globalError={globalError}
      layout={"vertical"}
      name={"form_in_modal"}
      initialValues={initialValues}
    >
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
    </Form>
  );
};

export default ContactForm;
