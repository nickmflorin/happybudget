import { Form } from "components";
import { DatePicker } from "components/fields";

export type ImportActualsPlaidFormValues = {
  readonly start_date: string;
  readonly end_date: string | null;
};

export type ImportActualsPlaidFormProps = FormProps<ImportActualsPlaidFormValues>;

// TODO: Fix DatePicker getting cut off by modal bounds
const ImportActualsPlaidForm = (props: ImportActualsPlaidFormProps) => (
  <Form.Form id={"testtesttest"} layout={"vertical"} {...props}>
    <Form.Item required={true} label="Start Date" name={"start_date"}>
      <DatePicker dateFormat={"dd/MM/yyyy"} />
    </Form.Item>
    <Form.Item label="End Date" name={"end_date"}>
      <DatePicker dateFormat={"dd/MM/yyyy"} />
    </Form.Item>
  </Form.Form>
);

export default ImportActualsPlaidForm;
