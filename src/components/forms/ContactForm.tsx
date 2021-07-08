import { Input, Select } from "antd";
import { MailOutlined, UserOutlined } from "@ant-design/icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobeAmericas, faUserTag, faDollarSign, faBuilding } from "@fortawesome/free-solid-svg-icons";

import { ContactRoles } from "lib/model";

import { Form } from "components";
import { FormProps } from "components/Form";
import PhoneNumberInput from "./PhoneNumberInput";

const ContactForm: React.FC<FormProps<Http.ContactPayload>> = ({ form, initialValues, globalError }) => {
  return (
    <Form.Form
      form={form}
      globalError={globalError}
      layout={"vertical"}
      name={"form_in_modal"}
      initialValues={initialValues}
    >
      <Form.Item name={"first_name"} label={"First Name"}>
        <Input prefix={<UserOutlined />} placeholder={"John"} />
      </Form.Item>
      <Form.Item name={"last_name"} label={"Last Name"}>
        <Input prefix={<UserOutlined />} placeholder={"Smith"} />
      </Form.Item>
      <Form.Item name={"company"} label={"Company"}>
        <Input prefix={<FontAwesomeIcon icon={faBuilding} />} placeholder={"ACME Corporation"} />
      </Form.Item>
      <Form.Item name={"email"} label={"Email"}>
        <Input prefix={<MailOutlined />} placeholder={"jsmith@gmail.com"} />
      </Form.Item>
      <Form.Item name={"city"} label={"City"}>
        <Input prefix={<FontAwesomeIcon icon={faGlobeAmericas} />} placeholder={"Los Angeles"} />
      </Form.Item>
      <Form.Item name={"phone_number"} label={"Phone Number"}>
        <PhoneNumberInput placeholder={"(123) 456-7890"} />
      </Form.Item>
      <Form.Item name={"role"} label={"Role"}>
        <Select suffixIcon={<FontAwesomeIcon icon={faUserTag} />} placeholder={"Producer"}>
          {ContactRoles.map((model: Model.ContactRole, index: number) => (
            <Select.Option key={index} value={model.id}>
              {model.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name={"rate"} label={"Rate"}>
        <Input prefix={<FontAwesomeIcon icon={faDollarSign} />} placeholder={"100 /hr"} />
      </Form.Item>
    </Form.Form>
  );
};

export default ContactForm;
