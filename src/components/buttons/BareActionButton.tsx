import classNames from "classnames";

import { ui } from "lib";

import { ActionButton, ActionButtonProps, ActionAnchor, ActionAnchorProps } from "./abstract";

type BareActionProps<
  P extends
    | ActionAnchorProps<typeof ui.ButtonActionVariants.BARE>
    | ActionButtonProps<typeof ui.ButtonActionVariants.BARE> =
    | ActionAnchorProps<typeof ui.ButtonActionVariants.BARE>
    | ActionButtonProps<typeof ui.ButtonActionVariants.BARE>,
> = Omit<P, "variant"> & {
  readonly color?: ui.IconColor;
};

export type BareActionButtonProps = BareActionProps<
  ActionButtonProps<typeof ui.ButtonActionVariants.BARE>
>;

export const BareActionButton = ({ color, ...props }: BareActionButtonProps) => (
  <ActionButton
    {...props}
    variant={ui.ButtonActionVariants.BARE}
    className={classNames(
      color !== undefined && `button--action--bare--color-${color}`,
      props.className,
    )}
  />
);

export type BareActionAnchorProps = BareActionProps<
  ActionAnchorProps<typeof ui.ButtonActionVariants.BARE>
>;

export const BareActionAnchor = ({ color, ...props }: BareActionAnchorProps) => (
  <ActionAnchor
    {...props}
    variant={ui.ButtonActionVariants.BARE}
    className={classNames(
      color !== undefined && `button--action--bare--color-${color}`,
      props.className,
    )}
  />
);
