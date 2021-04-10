import { Input, Select } from "antd";
import { FormInstance } from "antd/lib/form";
import { MailOutlined, UserOutlined } from "@ant-design/icons";

import { Form as RootForm } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobeAmericas, faPhone, faUserTag } from "@fortawesome/free-solid-svg-icons";

import { ContactRoleModelsList } from "lib/model";
import { validateEmail } from "lib/util/validate";

import { Form } from "components";

interface ContactFormProps {
  form: FormInstance<Http.IContactPayload>;
  initialValues?: Http.IContactPayload;
  globalError?: string;
}

const ContactForm = ({ form, initialValues, globalError }: ContactFormProps): JSX.Element => {
  return (
    <Form.Form
      form={form}
      globalError={globalError}
      layout={"vertical"}
      name={"form_in_modal"}
      initialValues={initialValues}
    >
      <RootForm.Item
        name={"first_name"}
        label={"First Name"}
        rules={[{ required: true, message: "Please enter a valid first name." }]}
      >
        <Input prefix={<UserOutlined />} placeholder={"John"} />
      </RootForm.Item>
      <RootForm.Item
        name={"last_name"}
        label={"Last Name"}
        rules={[{ required: true, message: "Please enter a valid last name." }]}
      >
        <Input prefix={<UserOutlined />} placeholder={"Smith"} />
      </RootForm.Item>
      <RootForm.Item
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
      </RootForm.Item>
      <RootForm.Item name={"city"} label={"City"} rules={[{ required: true, message: "Please enter a valid city." }]}>
        <Input prefix={<FontAwesomeIcon icon={faGlobeAmericas} />} placeholder={"Los Angeles"} />
      </RootForm.Item>
      <RootForm.Item
        name={"country"}
        label={"Country"}
        rules={[{ required: true, message: "Please enter a valid country." }]}
      >
        <Input prefix={<FontAwesomeIcon icon={faGlobeAmericas} />} placeholder={"United States"} />
      </RootForm.Item>
      <RootForm.Item
        name={"phone_number"}
        label={"Phone Number"}
        rules={[{ required: true, message: "Please enter a valid phone number." }]}
      >
        <Input prefix={<FontAwesomeIcon icon={faPhone} />} placeholder={"+15551234567"} />
      </RootForm.Item>
      <RootForm.Item name={"role"} label={"Role"} rules={[{ required: true }]}>
        <Select suffixIcon={<FontAwesomeIcon icon={faUserTag} />} placeholder={"Producer"}>
          {ContactRoleModelsList.map((model: ContactRoleModel, index: number) => (
            <Select.Option key={index} value={model.id}>
              {model.name}
            </Select.Option>
          ))}
        </Select>
      </RootForm.Item>
    </Form.Form>
  );
};

export default ContactForm;
