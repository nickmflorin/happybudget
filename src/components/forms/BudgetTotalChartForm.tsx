import { map } from "lodash";

import { Checkbox } from "antd";

import { Form, Icon } from "components";
import { Select } from "components/fields";

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
      <Select suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />}>
        {map(metrics, (metric: Charts.BudgetTotal.Metric, index: number) => (
          <Select.Option key={index} value={metric.id}>
            {metric.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  </Form.Form>
);

export default BudgetTotalChartForm;
