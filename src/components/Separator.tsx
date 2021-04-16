import classNames from "classnames";
import { isNil } from "lodash";
import "./Separator.scss";

interface SeparatorProps extends StandardComponentProps {
  margin?: string | number;
  color?: string;
}

const Separator: React.FC<SeparatorProps> = ({ className, style, margin, color }) => {
  if (!isNil(margin) || !isNil(color)) {
    style = style || {};
    if (!isNil(margin)) {
      style.marginTop = margin;
      style.marginBottom = margin;
    }
    if (!isNil(color)) {
      style.borderBottom = `1px solid ${color}`;
    }
  }
  return <div className={classNames("separator", className)} style={style}></div>;
};

export default Separator;
