import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePortal } from "lib/hooks";
import { isNil } from "lodash";

export interface PortalProps {
  id: string | number;
  visible?: boolean;
  children: ReactNode;
}

const Portal = ({ id, children, visible }: PortalProps): JSX.Element => {
  const target = usePortal(id);
  if (!isNil(target) && visible === true) {
    return createPortal(children, target);
  }
  return <></>;
};

export default Portal;
