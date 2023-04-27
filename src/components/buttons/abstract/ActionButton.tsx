import { useMemo } from "react";

import classNames from "classnames";

import { icons } from "lib/ui";
import * as buttons from "lib/ui/buttons/types";
import { Spinner } from "components/loading";

import { Button, ButtonProps, Anchor, AnchorProps } from "./Button";

type ActionProps<
  V extends buttons.ButtonActionVariant = buttons.ButtonActionVariant,
  P extends
    | ButtonProps<typeof buttons.ButtonVariants.ACTION>
    | AnchorProps<typeof buttons.ButtonVariants.ACTION> =
    | ButtonProps<typeof buttons.ButtonVariants.ACTION>
    | AnchorProps<typeof buttons.ButtonVariants.ACTION>,
> = Omit<P, "children" | "variant"> & {
  readonly icon: icons.IconProp;
  readonly variant?: V;
};

// Provides the common props that are used for both the Button and the Anchor cases.
const useActionProps = <V extends buttons.ButtonActionVariant = buttons.ButtonActionVariant>(
  props: Pick<ActionProps<V>, "loading" | "icon" | "variant" | "className">,
) =>
  useMemo(
    () => ({
      variant: buttons.ButtonVariants.ACTION,
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

export type ActionButtonProps<V extends buttons.ButtonActionVariant = buttons.ButtonActionVariant> =
  ActionProps<V, ButtonProps<typeof buttons.ButtonVariants.ACTION>>;

export const ActionButton = <V extends buttons.ButtonActionVariant = buttons.ButtonActionVariant>({
  icon,
  ...props
}: ActionButtonProps<V>) => {
  const ps = useActionProps<V>({ icon, ...props });
  return <Button {...props} {...ps} />;
};

export type ActionAnchorProps<V extends buttons.ButtonActionVariant = buttons.ButtonActionVariant> =
  ActionProps<V, AnchorProps<typeof buttons.ButtonVariants.ACTION>>;

export const ActionAnchor = <V extends buttons.ButtonActionVariant = buttons.ButtonActionVariant>({
  icon,
  ...props
}: ActionAnchorProps<V>) => {
  const ps = useActionProps<V>({ icon, ...props });
  return <Anchor {...props} {...ps} />;
};
