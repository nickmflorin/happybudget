import classNames from "classnames";

import { ui } from "lib";

export type HeadingTextProps = ui.ComponentProps<{
  readonly level?: ui.TypographyTypeLevel<"heading">;
  readonly style?: Omit<ui.Style, ui.CSSFontProperties>;
  readonly weight?: ui.TypographyWeightName;
  readonly children: string;
}>;

type Factories = {
  [key in ui.TypographyTypeLevel<"heading">]: (
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
  factories[level || ui.DEFAULT_HEADING_LEVEL]({
    ...props,
    className: classNames(
      "heading",
      `heading--${level || ui.DEFAULT_HEADING_LEVEL}`,
      weight !== undefined && `body--weight-type-${weight}`,
      props.className,
    ),
  });
