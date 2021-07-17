import classNames from "classnames";

const FormLabel = (props: StandardComponentWithChildrenProps & { section?: boolean }): JSX.Element => {
  return (
    <div className={"ant-col ant-form-item-label"}>
      <label className={classNames({ "label--section": props.section }, props.className)} style={props.style}>
        {props.children}
      </label>
    </div>
  );
};

export default FormLabel;
