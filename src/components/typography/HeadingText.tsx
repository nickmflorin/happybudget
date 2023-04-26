import classNames from "classnames";

import * as ui from "lib/ui/types";
import * as typography from "lib/ui/typography/types";

export type HeadingTextProps = ui.ComponentProps<{
  readonly level?: typography.TypographyTypeLevel<"heading">;
  readonly style?: Omit<ui.Style, ui.CSSFontProperties>;
  readonly weight?: typography.TypographyWeightName;
  readonly children: string;
}>;

type Factories = {
  [key in typography.TypographyTypeLevel<"heading">]: (
    props: Omit<HeadingTextProps, "level">,
  ) => JSX.Element;
};

const factories: Factories = {
  1: props => <h1 {...props} />,
  2: props => <h2 {...props} />,
  3: props => <h3 {...props} />,
  4: props => <h4 {...props} />,
};

export const HeadingText = ({ level, weight, ...props }: HeadingTextProps) =>
  factories[level || typography.DEFAULT_HEADING_LEVEL]({
    ...props,
    className: classNames(
      "heading",
      `heading--${level || typography.DEFAULT_HEADING_LEVEL}`,
      weight !== undefined && `body--weight-type-${weight}`,
      props.className,
    ),
  });
