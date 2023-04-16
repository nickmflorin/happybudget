import { useMemo } from "react";

import classNames from "classnames";

import { ui } from "lib";
import { Spinner } from "components/loading";

import { Button, ButtonProps, Anchor, AnchorProps } from "./Button";

type ActionProps<
  V extends ui.ButtonActionVariant = ui.ButtonActionVariant,
  P extends
    | ButtonProps<typeof ui.ButtonVariants.ACTION>
    | AnchorProps<typeof ui.ButtonVariants.ACTION> =
    | ButtonProps<typeof ui.ButtonVariants.ACTION>
    | AnchorProps<typeof ui.ButtonVariants.ACTION>,
> = Omit<P, "children" | "variant"> & {
  readonly icon: ui.IconProp;
  readonly variant?: V;
};

// Provides the common props that are used for both the Button and the Anchor cases.
const useActionProps = <V extends ui.ButtonActionVariant = ui.ButtonActionVariant>(
  props: Pick<ActionProps<V>, "loading" | "icon" | "variant" | "className">,
) =>
  useMemo(
    () => ({
      variant: ui.ButtonVariants.ACTION,
      className: classNames(
        props.variant !== undefined && `button--action--${props.variant}`,
        props.className,
      ),
      children: (
        <Spinner
          className="icon-spinner--button"
          fallbackIcon={props.icon}
          loading={props.loading}
          size="fill"
        />
      ),
    }),
    [props.className, props.icon, props.variant, props.loading],
  );

export type ActionButtonProps<V extends ui.ButtonActionVariant = ui.ButtonActionVariant> =
  ActionProps<V, ButtonProps<typeof ui.ButtonVariants.ACTION>>;

export const ActionButton = <V extends ui.ButtonActionVariant = ui.ButtonActionVariant>({
  icon,
  ...props
}: ActionButtonProps<V>) => {
  const ps = useActionProps<V>({ icon, ...props });
  return <Button {...props} {...ps} />;
};

export type ActionAnchorProps<V extends ui.ButtonActionVariant = ui.ButtonActionVariant> =
  ActionProps<V, AnchorProps<typeof ui.ButtonVariants.ACTION>>;

export const ActionAnchor = <V extends ui.ButtonActionVariant = ui.ButtonActionVariant>({
  icon,
  ...props
}: ActionAnchorProps<V>) => {
  const ps = useActionProps<V>({ icon, ...props });
  return <Anchor {...props} {...ps} />;
};
