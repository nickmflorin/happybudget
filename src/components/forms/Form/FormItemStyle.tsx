import { ReactNode } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { ShowHide } from "components";
import FormLabel from "./FormLabel";

export interface FormItemStyleProps extends StandardComponentProps {
  readonly label?: string;
  readonly children: ReactNode;
  readonly labelStyle?: React.CSSProperties;
  readonly labelClassName?: string;
  readonly section?: boolean;
  readonly dataType?: Table.ColumnDataTypeId;
}

/**
 * A container component for a Form field that is meant to be styled somewhat
 * like a traditional AntD Form.Item but without exposing the underlying mechanics
 * that come with using the traditional Form.Item.  This is meant to be used for
 * fields that cannot be wrapped by a Form.Item in a form, but still want to be
 * styled as such.
 *
 * Note that this does not come with all the layout bells and whistles that
 * the traditional Form.Item does - so we need to improvise.
 */
const FormItemStyle = (props: FormItemStyleProps): JSX.Element => {
  return (
    <div className={classNames("form-item", props.className)} style={props.style}>
      <ShowHide show={!isNil(props.label)}>
        <div className={"ant-col ant-form-item-label"}>
          <FormLabel
            className={props.labelClassName}
            style={props.labelStyle}
            section={props.section}
            dataType={props.dataType}
          >
            {props.label}
          </FormLabel>
        </div>
      </ShowHide>
      {props.children}
    </div>
  );
};

export default FormItemStyle;
