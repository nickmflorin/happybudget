import classNames from "classnames";

import * as buttons from "lib/ui/buttons";
import * as icons from "lib/ui/icons";

import { ActionButton, ActionButtonProps, ActionAnchor, ActionAnchorProps } from "./abstract";

type BareActionProps<
  P extends
    | ActionAnchorProps<typeof buttons.ButtonActionVariants.BARE>
    | ActionButtonProps<typeof buttons.ButtonActionVariants.BARE> =
    | ActionAnchorProps<typeof buttons.ButtonActionVariants.BARE>
    | ActionButtonProps<typeof buttons.ButtonActionVariants.BARE>,
> = Omit<P, "variant"> & {
  readonly color?: icons.IconColor;
};

export type BareActionButtonProps = BareActionProps<
  ActionButtonProps<typeof buttons.ButtonActionVariants.BARE>
>;

export const BareActionButton = ({ color, ...props }: BareActionButtonProps) => (
  <ActionButton
    {...props}
    variant={buttons.ButtonActionVariants.BARE}
    className={classNames(
      color !== undefined && `button--action--bare--color-${color}`,
      props.className,
    )}
  />
);

export type BareActionAnchorProps = BareActionProps<
  ActionAnchorProps<typeof buttons.ButtonActionVariants.BARE>
>;

export const BareActionAnchor = ({ color, ...props }: BareActionAnchorProps) => (
  <ActionAnchor
    {...props}
    variant={buttons.ButtonActionVariants.BARE}
    className={classNames(
      color !== undefined && `button--action--bare--color-${color}`,
      props.className,
    )}
  />
);
