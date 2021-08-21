import { useMemo } from "react";
import { isNil } from "lodash";

import { Icon } from "components";
import { iconIsJSX, clickableIconIsCallback } from "./typeguards";

export const useClickableIcon = (
  icon: ClickableIconOrElement | undefined | null,
  params: ClickableIconCallbackParams
): JSX.Element | null => {
  const iCon = useMemo(() => {
    let ic: IconOrElement;
    if (!isNil(icon)) {
      if (clickableIconIsCallback(icon)) {
        ic = icon(params);
      } else {
        ic = icon;
      }
      return iconIsJSX(ic) ? ic : <Icon icon={ic} />;
    }
    return null;
  }, [icon, params]);
  return iCon;
};
