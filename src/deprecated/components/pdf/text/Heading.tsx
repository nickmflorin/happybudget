import classNames from "classnames";

import Text, { TextProps } from "./Text";

export type HeadingProps = TextProps & {
  readonly level: Pdf.HeadingLevel;
};

const Heading = ({ level, ...props }: HeadingProps): JSX.Element => (
  <Text {...props} className={classNames(`h${level}`, props.className)} />
);

export default Heading;
