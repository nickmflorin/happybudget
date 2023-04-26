import classNames from "classnames";

import * as buttons from "lib/ui/buttons/types";

import {
  ContentAnchorProps,
  ContentAnchor,
  ContentButton,
  ContentButtonProps,
} from "./ContentButton";

type AlternateProps<
  V extends buttons.ButtonAlternateVariant,
  P extends
    | ContentButtonProps<typeof buttons.ButtonVariants.ALTERNATE>
    | ContentAnchorProps<typeof buttons.ButtonVariants.ALTERNATE> =
    | ContentButtonProps<typeof buttons.ButtonVariants.ALTERNATE>
    | ContentAnchorProps<typeof buttons.ButtonVariants.ALTERNATE>,
> = Omit<P, "variant"> & {
  readonly variant: V;
};

export type AlternateButtonProps<V extends buttons.ButtonAlternateVariant> = AlternateProps<
  V,
  ContentButtonProps<typeof buttons.ButtonVariants.ALTERNATE>
>;

export const AlternateButton = <V extends buttons.ButtonAlternateVariant>({
  variant,
  ...props
}: AlternateButtonProps<V>) => (
  <ContentButton
    {...props}
    variant={buttons.ButtonVariants.ALTERNATE}
    className={classNames(`button--alternate--${variant}`, props.className)}
  />
);

export type AlternateAnchorProps<V extends buttons.ButtonAlternateVariant> = AlternateProps<
  V,
  ContentAnchorProps<typeof buttons.ButtonVariants.ALTERNATE>
>;

export const AlternateAnchor = <V extends buttons.ButtonAlternateVariant>({
  variant,
  ...props
}: AlternateAnchorProps<V>) => (
  <ContentAnchor
    {...props}
    variant={buttons.ButtonVariants.ALTERNATE}
    className={classNames(`button--alternate--${variant}`, props.className)}
  />
);
