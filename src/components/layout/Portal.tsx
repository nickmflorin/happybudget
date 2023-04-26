import { ReactNode } from "react";
import { createPortal } from "react-dom";

import { usePortal } from "lib/ui/hooks";

export interface PortalProps {
  id: string | number | undefined;
  visible?: boolean;
  children: ReactNode;
}

export const Portal = ({ id, children, visible }: PortalProps): JSX.Element => {
  const target = usePortal(id);
  if (target !== null && visible !== false) {
    return createPortal(children, target);
  }
  return <></>;
};
