import { Checkbox } from "antd";

import { Form } from "components";
import { SingleModelSyncSelect } from "components/fields";

export type BudgetTotalChartFormValues = {
  readonly metric: Charts.BudgetTotal.MetricId;
  readonly grouped: boolean;
};

interface BudgetTotalChartFormProps extends FormProps<BudgetTotalChartFormValues> {
  readonly metrics: Charts.BudgetTotal.Metric[];
}

const BudgetTotalChartForm = ({ metrics, ...props }: BudgetTotalChartFormProps) => (
  <Form.Form {...props} condensed={true} layout={"horizontal"}>
    <Form.Item name={"grouped"} label={"Grouped"} valuePropName={"checked"}>
      <Checkbox defaultChecked={props.initialValues?.grouped} />
    </Form.Item>
    <Form.Item name={"metric"}>
      <SingleModelSyncSelect options={metrics} getOptionLabel={(m: Charts.BudgetTotal.Metric) => m.label} />
    </Form.Item>
  </Form.Form>
);

export default BudgetTotalChartForm;
