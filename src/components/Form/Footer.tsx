import classNames from "classnames";
import { FormFooterProps } from "./model";

const Footer = ({ children, className, style = {} }: FormFooterProps) => {
  return (
    <div className={classNames("form-footer", className)} style={style}>
      {children}
    </div>
  );
};

export default Footer;
