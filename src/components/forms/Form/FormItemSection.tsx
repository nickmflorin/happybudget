import classNames from "classnames";

import FormItemStyle, { FormItemStyleProps } from "./FormItemStyle";

const FormItemSection = (props: FormItemStyleProps): JSX.Element => {
  return (
    <FormItemStyle
      {...props}
      className={classNames("form-item-section", props.className)}
      labelClassName={classNames("label--section", props.labelClassName)}
    >
      {props.children}
    </FormItemStyle>
  );
};

export default FormItemSection;
