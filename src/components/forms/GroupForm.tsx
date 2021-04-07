import { Input } from "antd";
import { FormInstance, FormProps } from "antd/lib/form";

import { ColorSelect } from "components/control";
import { Form } from "components/forms";

export interface GroupFormValues {
  name: string;
  color: string;
}

interface GroupFormProps extends FormProps {
  form: FormInstance<GroupFormValues>;
  initialValues?: Partial<GroupFormValues>;
  globalError?: string;
}

const GroupForm = ({ form, initialValues = {}, globalError, ...props }: GroupFormProps): JSX.Element => {
  return (
    <Form<GroupFormValues>
      form={form}
      layout={"vertical"}
      globalError={globalError}
      initialValues={initialValues}
      {...props}
    >
      <Form.Item name={"name"} rules={[{ required: true, message: "Please provide a valid name for the group." }]}>
        <Input placeholder={"Name"} />
      </Form.Item>
      <Form.Item
        name={"color"}
        label={"Color"}
        rules={[{ required: true, message: "Please select a color for the group." }]}
      >
        <ColorSelect
          colors={[
            "#797695",
            "#ff7165",
            "#80cbc4",
            "#ce93d8",
            "#fed835",
            "#c87987",
            "#69f0ae",
            "#a1887f",
            "#81d4fa",
            "#f75776",
            "#66bb6a",
            "#58add6"
          ]}
        />
      </Form.Item>
    </Form>
  );
};

export default GroupForm;
