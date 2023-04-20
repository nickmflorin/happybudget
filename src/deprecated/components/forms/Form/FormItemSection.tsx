import classNames from "classnames";

import FormItem, { FormItemProps } from "./FormItem";

type FormItemSectionProps = StandardComponentProps & Pick<FormItemProps, "label" | "children">;

const FormItemSection = (props: FormItemSectionProps): JSX.Element => (
  <FormItem {...props} className={classNames("form-item-section", props.className)}>
    {props.children}
  </FormItem>
);

export default FormItemSection;
