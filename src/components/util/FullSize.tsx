import classNames from "classnames";

const FullSize = ({ children, ...props }: StandardComponentWithChildrenProps): JSX.Element => {
  return (
    <div className={classNames("full-size", props.className)} {...props}>
      {children}
    </div>
  );
};

export default FullSize;
