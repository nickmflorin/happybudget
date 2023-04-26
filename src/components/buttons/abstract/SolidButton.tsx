import classNames from "classnames";

import * as buttons from "lib/ui/buttons/types";

import {
  ContentAnchor,
  ContentAnchorProps,
  ContentButton,
  ContentButtonProps,
} from "./ContentButton";

export type SolidButtonProps<V extends buttons.ButtonSolidVariant> = Omit<
  ContentButtonProps<typeof buttons.ButtonVariants.SOLID>,
  "variant"
> & {
  readonly variant: V;
};

export const SolidButton = <V extends buttons.ButtonSolidVariant>({
  variant,
  ...props
}: SolidButtonProps<V>) => (
  <ContentButton
    {...props}
    variant={buttons.ButtonVariants.SOLID}
    className={classNames(`button--solid--${variant}`, props.className)}
  />
);

export type SolidAnchorProps<V extends buttons.ButtonSolidVariant> = Omit<
  ContentAnchorProps<typeof buttons.ButtonVariants.SOLID>,
  "variant"
> & {
  readonly variant: V;
};

export const SolidAnchor = <V extends buttons.ButtonSolidVariant>({
  variant,
  ...props
}: SolidAnchorProps<V>) => (
  <ContentAnchor
    {...props}
    variant={buttons.ButtonVariants.SOLID}
    className={classNames(`button--solid--${variant}`, props.className)}
  />
);
