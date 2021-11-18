import classNames from "classnames";

import FormLabelContent from "./FormLabelContent";

interface FormLabelProps extends StandardComponentWithChildrenProps {
  readonly section?: boolean;
  readonly columnType?: Table.ColumnTypeId;
}

const FormLabel = ({ section, columnType, ...props }: FormLabelProps): JSX.Element => {
  return (
    <label className={classNames({ "label--section": section }, props.className)} style={props.style}>
      <FormLabelContent columnType={columnType} section={section}>
        {props.children}
      </FormLabelContent>
    </label>
  );
};

export default FormLabel;
