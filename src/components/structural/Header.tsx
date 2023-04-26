import classNames from "classnames";

import * as ui from "lib/ui/types";

import { HeadingText, HeadingTextProps } from "components/typography";

import { AffixGroup, AffixGroupProps } from "./AffixGroup";

export type HeaderProps = Omit<HeadingTextProps, keyof ui.ComponentProps> &
  Pick<AffixGroupProps, "spacing" | "affixes"> &
  ui.ComponentProps<{
    affixesEnd?: AffixGroupProps["affixes"];
  }>;

export const Header = ({
  affixes,
  affixesEnd,
  level = ui.DEFAULT_HEADING_LEVEL,
  spacing = 10,
  children,
  ...props
}: HeaderProps): JSX.Element => (
  <div
    {...props}
    className={classNames(
      "structural-header",
      `structural-header--level-${level}`,
      props.className,
    )}
  >
    <div className="structural-header__left">
      <HeadingText className="heading-text--structural-header" level={level}>
        {children}
      </HeadingText>
      {affixes && (
        <AffixGroup data-testid="structural-header-affixes" spacing={spacing} affixes={affixes} />
      )}
    </div>
    {affixesEnd && (
      <AffixGroup
        data-testid="structural-header-affixes-end"
        spacing={spacing}
        affixes={affixesEnd}
      />
    )}
  </div>
);
