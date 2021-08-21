import React from "react";

export const iconIsJSX = (icon: IconOrElement): icon is JSX.Element => React.isValidElement(icon);
export const clickableIconIsCallback = (icon: ClickableIconOrElement): icon is ClickableIconCallback =>
  typeof icon === "function";
