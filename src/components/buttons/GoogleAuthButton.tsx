import React from "react";

import classNames from "classnames";

import { ui } from "lib";
import { GoogleIcon } from "components/svgs";

import { SolidButton, SolidButtonProps } from "./abstract";

export const GoogleAuthButton = ({
  children,
  ...props
}: Omit<
  SolidButtonProps<typeof ui.ButtonSolidVariants.WHITE>,
  "icon" | "size" | "variant"
>): JSX.Element => (
  <SolidButton
    {...props}
    className={classNames("btn--google", props.className)}
    icon={<GoogleIcon />}
    variant={ui.ButtonSolidVariants.WHITE}
    size={ui.ButtonSizes.LARGE}
  >
    {children}
  </SolidButton>
);
