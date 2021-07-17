import classNames from "classnames";
import Text, { TextProps } from "./Text";

export interface LabelProps extends TextProps {}

const Label = (props: LabelProps): JSX.Element => <Text {...props} className={classNames("label", props.className)} />;

export default Label;
