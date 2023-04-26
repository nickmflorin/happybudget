import React from "react";

import classNames from "classnames";

import * as buttons from "lib/ui/buttons/types";
import { GoogleIcon } from "components/icons";

import { SolidButton, SolidButtonProps } from "./abstract";

export const GoogleAuthButton = ({
  children,
  ...props
}: Omit<
  SolidButtonProps<typeof buttons.ButtonSolidVariants.WHITE>,
  "icon" | "size" | "variant"
>): JSX.Element => (
  <SolidButton
    {...props}
    className={classNames("btn--google", props.className)}
    icon={<GoogleIcon />}
    variant={buttons.ButtonSolidVariants.WHITE}
    size={buttons.ButtonSizes.LARGE}
  >
    {children}
  </SolidButton>
);
