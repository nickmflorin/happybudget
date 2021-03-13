import classNames from "classnames";
import { isNil } from "lodash";
import "./Separator.scss";

interface SeparatorProps {
  className?: string;
  style?: any;
  margin?: string | number;
  color?: string;
}

const Separator = ({ className, style, margin, color }: SeparatorProps): JSX.Element => {
  if (!isNil(margin) || !isNil(color)) {
    style = style || {};
    if (!isNil(margin)) {
      style.marginTop = margin;
      style.marginBottom = margin;
    }
    if (!isNil(color)) {
      style.color = color;
    }
  }
  return <div className={classNames("separator", className)} style={style}></div>;
};

export default Separator;
