import classNames from "classnames";

const FullSize = ({ children, ...props }: StandardComponentWithChildrenProps): JSX.Element => (
  <div className={classNames("full-size", props.className)} {...props}>
    {children}
  </div>
);

export default FullSize;
