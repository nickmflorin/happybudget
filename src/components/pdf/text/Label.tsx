import classNames from "classnames";
import Text, { TextProps } from "./Text";

export type LabelProps = TextProps;

const Label = (props: LabelProps): JSX.Element => <Text {...props} className={classNames("label", props.className)} />;

export default Label;
