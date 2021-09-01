import classNames from "classnames";

export interface FormFooterProps extends StandardComponentProps {
  readonly children: JSX.Element[] | JSX.Element;
  readonly style?: React.CSSProperties;
  readonly className?: string;
}

const Footer = ({ children, className, style = {} }: FormFooterProps) => {
  return (
    <div className={classNames("form-footer", className)} style={style}>
      {children}
    </div>
  );
};

export default Footer;
