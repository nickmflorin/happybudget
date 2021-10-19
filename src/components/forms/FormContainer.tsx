import classNames from "classnames";

type FormContainerProps = StandardComponentWithChildrenProps;

const FormContainer = ({ children, ...props }: FormContainerProps) => {
  return (
    <div {...props} className={classNames("form-container", props.className)}>
      {children}
    </div>
  );
};

export default FormContainer;
