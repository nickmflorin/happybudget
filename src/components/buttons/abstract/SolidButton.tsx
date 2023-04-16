import classNames from "classnames";

import { ui } from "lib";

import {
  ContentAnchor,
  ContentAnchorProps,
  ContentButton,
  ContentButtonProps,
} from "./ContentButton";

export type SolidButtonProps<V extends ui.ButtonSolidVariant> = Omit<
  ContentButtonProps<typeof ui.ButtonVariants.SOLID>,
  "variant"
> & {
  readonly variant: V;
};

export const SolidButton = <V extends ui.ButtonSolidVariant>({
  variant,
  ...props
}: SolidButtonProps<V>) => (
  <ContentButton
    {...props}
    variant={ui.ButtonVariants.SOLID}
    className={classNames(`button--solid--${variant}`, props.className)}
  />
);

export type SolidAnchorProps<V extends ui.ButtonSolidVariant> = Omit<
  ContentAnchorProps<typeof ui.ButtonVariants.SOLID>,
  "variant"
> & {
  readonly variant: V;
};

export const SolidAnchor = <V extends ui.ButtonSolidVariant>({
  variant,
  ...props
}: SolidAnchorProps<V>) => (
  <ContentAnchor
    {...props}
    variant={ui.ButtonVariants.SOLID}
    className={classNames(`button--solid--${variant}`, props.className)}
  />
);
