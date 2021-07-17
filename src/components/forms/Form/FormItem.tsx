import classNames from "classnames";
import { Form as AntdForm } from "antd";
import { FormItemProps } from "antd/lib/form";

const FormItem = (props: FormItemProps): JSX.Element => {
  return (
    <AntdForm.Item {...props} className={classNames("form-item", props.className)}>
      {props.children}
    </AntdForm.Item>
  );
};

export default FormItem;
