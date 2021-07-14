import { Input, Select } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/pro-solid-svg-icons";

import { ContactTypes } from "lib/model";

import { Form } from "components";
import { FormProps } from "components/forms/Form";
import { PhoneNumberInput } from "./fields";

const ContactForm: React.FC<FormProps<Http.ContactPayload>> = ({ form, initialValues, globalError }) => {
  return (
    <Form.Form
      form={form}
      globalError={globalError}
      layout={"vertical"}
      name={"form_in_modal"}
      initialValues={initialValues}
    >
      <Form.Item name={"type"} label={"Type"} className={"type-select"}>
        <Select suffixIcon={<FontAwesomeIcon icon={faCaretDown} />} placeholder={"Contractor"}>
          {ContactTypes.map((model: Model.ContactType, index: number) => (
            <Select.Option key={index} value={model.id}>
              {model.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name={"first_name"} label={"First Name"}>
        <Input placeholder={"John"} />
      </Form.Item>
      <Form.Item name={"last_name"} label={"Last Name"}>
        <Input placeholder={"Smith"} />
      </Form.Item>
      <Form.Item name={"company"} label={"Company"}>
        <Input placeholder={"ACME Corporation"} />
      </Form.Item>
      <Form.Item name={"position"} label={"Job Title"}>
        <Input placeholder={"Producer"} />
      </Form.Item>
      <Form.Item name={"city"} label={"City"}>
        <Input placeholder={"Los Angeles"} />
      </Form.Item>
      <Form.Item name={"email"} label={"Email"}>
        <Input placeholder={"jsmith@gmail.com"} />
      </Form.Item>
      <Form.Item name={"phone_number"} label={"Phone Number"}>
        <PhoneNumberInput placeholder={"(123) 456-7890"} />
      </Form.Item>
      <Form.Item name={"rate"} label={"Rate"}>
        <Input placeholder={"100 /hr"} />
      </Form.Item>
    </Form.Form>
  );
};

export default ContactForm;
