import { Form } from "components";
import { DatePicker } from "components/fields";

export type ImportActualsPlaidFormValues = {
  readonly start_date: Date;
  readonly end_date: Date | null;
};

export type ImportActualsPlaidFormProps = FormProps<ImportActualsPlaidFormValues>;

const ImportActualsPlaidForm = (props: ImportActualsPlaidFormProps) => (
  <Form.Form layout={"vertical"} {...props}>
    <Form.Item required={true} label="Start Date" name={"start_date"}>
      <DatePicker popperProps={{ strategy: "fixed" }} dateFormat={"dd/MM/yyyy"} />
    </Form.Item>
    <Form.Item label="End Date" name={"end_date"}>
      <DatePicker popperProps={{ strategy: "fixed" }} dateFormat={"dd/MM/yyyy"} />
    </Form.Item>
  </Form.Form>
);

export default ImportActualsPlaidForm;
