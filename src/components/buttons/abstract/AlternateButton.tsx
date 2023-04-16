import classNames from "classnames";

import { ui } from "lib";

import {
  ContentAnchorProps,
  ContentAnchor,
  ContentButton,
  ContentButtonProps,
} from "./ContentButton";

type AlternateProps<
  V extends ui.ButtonAlternateVariant,
  P extends
    | ContentButtonProps<typeof ui.ButtonVariants.ALTERNATE>
    | ContentAnchorProps<typeof ui.ButtonVariants.ALTERNATE> =
    | ContentButtonProps<typeof ui.ButtonVariants.ALTERNATE>
    | ContentAnchorProps<typeof ui.ButtonVariants.ALTERNATE>,
> = Omit<P, "variant"> & {
  readonly variant: V;
};

export type AlternateButtonProps<V extends ui.ButtonAlternateVariant> = AlternateProps<
  V,
  ContentButtonProps<typeof ui.ButtonVariants.ALTERNATE>
>;

export const AlternateButton = <V extends ui.ButtonAlternateVariant>({
  variant,
  ...props
}: AlternateButtonProps<V>) => (
  <ContentButton
    {...props}
    variant={ui.ButtonVariants.ALTERNATE}
    className={classNames(`button--alternate--${variant}`, props.className)}
  />
);

export type AlternateAnchorProps<V extends ui.ButtonAlternateVariant> = AlternateProps<
  V,
  ContentAnchorProps<typeof ui.ButtonVariants.ALTERNATE>
>;

export const AlternateAnchor = <V extends ui.ButtonAlternateVariant>({
  variant,
  ...props
}: AlternateAnchorProps<V>) => (
  <ContentAnchor
    {...props}
    variant={ui.ButtonVariants.ALTERNATE}
    className={classNames(`button--alternate--${variant}`, props.className)}
  />
);
