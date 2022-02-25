import React from "react";
import classNames from "classnames";

import FormLabelContent from "./FormLabelContent";

interface FormLabelProps extends StandardComponentWithChildrenProps {
  readonly section?: boolean;
  readonly dataType?: Table.ColumnDataTypeId;
}

const FormLabel = ({ section, dataType, ...props }: FormLabelProps): JSX.Element => (
  <label className={classNames({ "label--section": section }, props.className)} style={props.style}>
    <FormLabelContent dataType={dataType}>{props.children}</FormLabelContent>
  </label>
);

export default React.memo(FormLabel);
