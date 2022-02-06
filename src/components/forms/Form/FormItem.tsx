import classNames from "classnames";
import { isNil } from "lodash";
import { Form as AntdForm } from "antd";
import { FormItemProps as RootFormItemProps } from "antd/lib/form";

import FormLabelContent from "./FormLabelContent";

export type FormItemProps = RootFormItemProps & {
  readonly dataType?: Table.ColumnDataTypeId;
  /* The vertical/horizontal layout of a FormItem is determined based on the
     specification on the entire Form, but there are cases where we might want
     singular FormItem(s) to differ in layout inside the Form. */
  readonly horizontalLayoutOverride?: boolean;
  readonly verticalLayoutOverride?: boolean;
};

const FormItem = ({
  horizontalLayoutOverride,
  verticalLayoutOverride,
  dataType,
  ...props
}: FormItemProps): JSX.Element => {
  return (
    <AntdForm.Item
      {...props}
      className={classNames("form-item", props.className, {
        "horizontal-layout-override": horizontalLayoutOverride,
        "vertical-layout-override": verticalLayoutOverride
      })}
      label={!isNil(props.label) ? <FormLabelContent dataType={dataType}>{props.label}</FormLabelContent> : undefined}
    >
      {props.children}
    </AntdForm.Item>
  );
};

export default FormItem;
