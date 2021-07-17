import classNames from "classnames";
import Text, { TextProps } from "./Text";

export interface ParagraphProps extends TextProps {}

const Paragraph = (props: ParagraphProps): JSX.Element => (
  <Text {...props} className={classNames("paragraph", props.className)} />
);

export default Paragraph;
