import classNames from "classnames";
import { isNil, includes } from "lodash";
import { PrimitiveText } from "../primitive";
import { TextProps as PrimitiveTextProps } from "../primitive/Text";

export interface TextProps extends PrimitiveTextProps {
  readonly styles?: Pdf.FontStyle[];
}

const Text = ({ styles, ...props }: TextProps): JSX.Element => (
  <PrimitiveText
    {...props}
    className={classNames("text", props.className, {
      bold: !isNil(styles) && includes(styles, "bold"),
      italic: !isNil(styles) && includes(styles, "italic")
    })}
  />
);

export default Text;
