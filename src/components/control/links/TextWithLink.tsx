import { ReactNode } from "react";
import classNames from "classnames";

interface TextWithLinkLinkProps extends StandardComponentProps {
  children: ReactNode;
  onClick: () => void;
}

const TextWithLinkLink = ({ children, className, style = {}, onClick }: TextWithLinkLinkProps): JSX.Element => {
  return (
    <span onClick={() => onClick()} className={classNames("text-embedded-link", className)} style={style}>
      {children}
    </span>
  );
};

interface TextWithLinkProps extends StandardComponentProps {
  children: ReactNode;
}

const TextWithLink = ({ children, className, style = {} }: TextWithLinkProps): JSX.Element => {
  return (
    <span className={classNames("text-with-link", className)} style={style}>
      {children}
    </span>
  );
};

TextWithLink.Link = TextWithLinkLink;
export default TextWithLink;
