import classNames from "classnames";
import { isNil } from "lodash";
import { Form as AntdForm } from "antd";
import { FormItemProps as RootFormItemProps } from "antd/lib/form";

import FormLabelContent from "./FormLabelContent";

interface FormItemProps extends RootFormItemProps {
  readonly dataType?: Table.ColumnDataTypeId;
}

const FormItem = ({ dataType, ...props }: FormItemProps): JSX.Element => {
  return (
    <AntdForm.Item
      {...props}
      className={classNames("form-item", props.className)}
      label={!isNil(props.label) ? <FormLabelContent dataType={dataType}>{props.label}</FormLabelContent> : undefined}
    >
      {props.children}
    </AntdForm.Item>
  );
};

export default FormItem;
