import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { isNil } from "lodash";

import { hooks } from "lib";

export interface PortalProps {
  id: string | number;
  visible?: boolean;
  children: ReactNode;
}

const Portal = ({ id, children, visible }: PortalProps): JSX.Element => {
  const target = hooks.usePortal(id);
  if (!isNil(target) && visible !== false) {
    return createPortal(children, target);
  }
  return <></>;
};

export default Portal;
